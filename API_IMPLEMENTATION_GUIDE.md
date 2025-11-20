# Multi-Step Enrollment Form - API Implementation Guide

## API Endpoint Implementation

The form expects a POST endpoint at `/api/enrollments` to handle form submissions.

---

## File: `/src/app/api/enrollments/route.ts`

### Basic Implementation Template

```typescript
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route"; // Adjust path to your auth config
import { connectDB } from "@/lib/mongodb"; // Adjust to your DB connection
import Enrollment from "@/models/Enrollment"; // Your Enrollment model
import User from "@/models/User"; // Your User model
import Course from "@/models/Course"; // Your Course model

interface EnrollmentRequest {
  courseSlug: string;
  phone: string;
  currentJob: string;
  careerGoal: "freelance" | "abroad" | "job" | "remote-job";
  address: {
    division: string;
    district: string;
  };
  payment: {
    method: "bkash";
    bkashNumber: string;
    transactionId: string;
  };
}

export async function POST(request: NextRequest) {
  try {
    // 1. Get authenticated user
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.email) {
      return NextResponse.json(
        { success: false, error: "Unauthorized - Please log in first" },
        { status: 401 }
      );
    }

    // 2. Parse request body
    const body: EnrollmentRequest = await request.json();

    // 3. Validate required fields
    if (
      !body.courseSlug ||
      !body.phone ||
      !body.currentJob ||
      !body.careerGoal
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required fields",
        },
        { status: 400 }
      );
    }

    // 4. Validate address
    if (!body.address?.division || !body.address?.district) {
      return NextResponse.json(
        {
          success: false,
          error: "Address information is required",
        },
        { status: 400 }
      );
    }

    // 5. Validate payment information
    if (!body.payment?.bkashNumber || !body.payment?.transactionId) {
      return NextResponse.json(
        {
          success: false,
          error: "Payment information is incomplete",
        },
        { status: 400 }
      );
    }

    // 6. Connect to database
    await connectDB();

    // 7. Find user
    const user = await User.findOne({ email: session.user.email });

    if (!user) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    // 8. Find course
    const course = await Course.findOne({ slug: body.courseSlug });

    if (!course) {
      return NextResponse.json(
        { success: false, error: "Course not found" },
        { status: 404 }
      );
    }

    // 9. Check if already enrolled
    const existingEnrollment = await Enrollment.findOne({
      userId: user._id,
      courseId: course._id,
    });

    if (existingEnrollment) {
      return NextResponse.json(
        {
          success: false,
          error: "You are already enrolled in this course",
        },
        { status: 409 }
      );
    }

    // 10. Validate phone number (basic validation)
    const phoneRegex = /^[\d\s\-+()]{10,}$/;
    if (!phoneRegex.test(body.phone)) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid phone number format",
        },
        { status: 400 }
      );
    }

    // 11. Validate bKash transaction (optional - implement with actual bKash API)
    // For now, we'll assume manual verification by admin
    // In production, you might want to verify with bKash API

    const isValidTransaction = await verifyBkashTransaction(
      body.payment.bkashNumber,
      body.payment.transactionId
    );

    if (!isValidTransaction) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Transaction verification failed. Please check your Transaction ID.",
        },
        { status: 400 }
      );
    }

    // 12. Create enrollment record
    const enrollment = new Enrollment({
      userId: user._id,
      courseId: course._id,
      courseSlug: body.courseSlug,
      status: "pending", // Will be verified by admin
      enrollmentData: {
        phone: body.phone,
        currentJob: body.currentJob,
        careerGoal: body.careerGoal,
        address: {
          division: body.address.division,
          district: body.address.district,
        },
      },
      paymentData: {
        method: "bkash",
        bkashNumber: body.payment.bkashNumber,
        transactionId: body.payment.transactionId,
        verificationStatus: "pending", // Admin will verify
        verifiedAt: null,
      },
      enrolledAt: new Date(),
    });

    await enrollment.save();

    // 13. Update course enrollment count (optional)
    await Course.findByIdAndUpdate(
      course._id,
      { $inc: { students: 1 } },
      { new: true }
    );

    // 14. Send confirmation email (optional)
    await sendEnrollmentConfirmationEmail(user.email, course.title);

    // 15. Return success response
    return NextResponse.json(
      {
        success: true,
        data: {
          id: enrollment._id.toString(),
          userId: user._id.toString(),
          courseSlug: body.courseSlug,
          status: "pending",
          enrolledAt: enrollment.enrolledAt,
          message:
            "Enrollment request submitted successfully. Your payment will be verified within 24 hours.",
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Enrollment error:", error);

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "An error occurred during enrollment",
      },
      { status: 500 }
    );
  }
}

// Helper function to verify bKash transaction
async function verifyBkashTransaction(
  bkashNumber: string,
  transactionId: string
): Promise<boolean> {
  try {
    // TODO: Implement actual bKash API verification
    // For now, this is a placeholder that returns true
    // You should implement actual verification with bKash API

    // Example structure (replace with actual bKash API calls):
    // const response = await fetch('https://bkash-api.com/verify', {
    //   method: 'POST',
    //   headers: { 'Authorization': `Bearer ${process.env.BKASH_API_KEY}` },
    //   body: JSON.stringify({
    //     transactionId,
    //     number: bkashNumber,
    //     amount: process.env.COURSE_PRICE
    //   })
    // });

    // Basic validation - transaction ID should be alphanumeric and 8+ chars
    const isValidFormat = /^[A-Z0-9]{8,}$/.test(transactionId.toUpperCase());

    // In production, replace with actual bKash API call
    // For development, we'll just validate format and return true
    return isValidFormat;
  } catch (error) {
    console.error("Transaction verification error:", error);
    return false;
  }
}

// Helper function to send confirmation email
async function sendEnrollmentConfirmationEmail(
  email: string,
  courseName: string
): Promise<void> {
  try {
    // TODO: Implement with your email service (Resend, SendGrid, etc.)
    // Example with Resend:
    // await resend.emails.send({
    //   from: "noreply@your-domain.com",
    //   to: email,
    //   subject: "Enrollment Request Received",
    //   html: `
    //     <h1>Enrollment Confirmed</h1>
    //     <p>Thank you for enrolling in ${courseName}!</p>
    //     <p>Your payment will be verified within 24 hours.</p>
    //   `
    // });

    console.log(`Confirmation email would be sent to: ${email}`);
  } catch (error) {
    console.error("Email send error:", error);
    // Don't fail the enrollment if email fails
  }
}
```

---

## Enrollment Model Schema

File: `/src/models/Enrollment.ts`

```typescript
import mongoose from "mongoose";

const enrollmentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    courseSlug: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    enrollmentData: {
      phone: String,
      currentJob: String,
      careerGoal: {
        type: String,
        enum: ["freelance", "abroad", "job", "remote-job"],
      },
      address: {
        division: String,
        district: String,
      },
    },
    paymentData: {
      method: {
        type: String,
        default: "bkash",
      },
      bkashNumber: String,
      transactionId: String,
      verificationStatus: {
        type: String,
        enum: ["pending", "verified", "failed"],
        default: "pending",
      },
      verifiedAt: Date,
      amount: Number,
    },
    enrolledAt: {
      type: Date,
      default: Date.now,
    },
    approvedAt: Date,
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    rejectionReason: String,
  },
  { timestamps: true }
);

// Compound index to prevent duplicate enrollments
enrollmentSchema.index({ userId: 1, courseId: 1 }, { unique: true });

export default mongoose.models.Enrollment ||
  mongoose.model("Enrollment", enrollmentSchema);
```

---

## Additional API Endpoints

### GET `/api/enrollments` - Get user's enrollments

```typescript
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    await connectDB();

    const user = await User.findOne({ email: session.user.email });

    const enrollments = await Enrollment.find({
      userId: user._id,
    })
      .populate("courseId", "title slug thumbnail")
      .sort({ enrolledAt: -1 });

    return NextResponse.json({
      success: true,
      data: enrollments,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to fetch enrollments" },
      { status: 500 }
    );
  }
}
```

### GET `/api/enrollments/course/[slug]` - Get user's enrollment for a specific course

```typescript
export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    await connectDB();

    const user = await User.findOne({ email: session.user.email });
    const course = await Course.findOne({ slug: params.slug });

    if (!course) {
      return NextResponse.json(
        { success: false, error: "Course not found" },
        { status: 404 }
      );
    }

    const enrollment = await Enrollment.findOne({
      userId: user._id,
      courseId: course._id,
    });

    if (!enrollment) {
      return NextResponse.json({
        success: false,
        data: null,
      });
    }

    return NextResponse.json({
      success: true,
      data: enrollment,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to fetch enrollment" },
      { status: 500 }
    );
  }
}
```

---

## Admin Dashboard Endpoint

### GET `/api/admin/enrollments` - List all pending enrollments

```typescript
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    // Check if user is admin
    if (session?.user?.role !== "admin") {
      return NextResponse.json(
        { success: false, error: "Admin access required" },
        { status: 403 }
      );
    }

    await connectDB();

    const enrollments = await Enrollment.find({ status: "pending" })
      .populate("userId", "email name phone")
      .populate("courseId", "title slug")
      .sort({ enrolledAt: -1 });

    return NextResponse.json({
      success: true,
      data: enrollments,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to fetch enrollments" },
      { status: 500 }
    );
  }
}
```

### PATCH `/api/admin/enrollments/[id]/verify` - Verify enrollment

```typescript
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (session?.user?.role !== "admin") {
      return NextResponse.json(
        { success: false, error: "Admin access required" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { isApproved, rejectionReason } = body;

    await connectDB();

    const enrollment = await Enrollment.findByIdAndUpdate(
      params.id,
      {
        status: isApproved ? "approved" : "rejected",
        "paymentData.verificationStatus": isApproved ? "verified" : "failed",
        "paymentData.verifiedAt": new Date(),
        approvedAt: isApproved ? new Date() : undefined,
        approvedBy: session.user?.id,
        rejectionReason: !isApproved ? rejectionReason : undefined,
      },
      { new: true }
    )
      .populate("userId", "email name")
      .populate("courseId", "title");

    return NextResponse.json({
      success: true,
      data: enrollment,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to update enrollment" },
      { status: 500 }
    );
  }
}
```

---

## Error Handling

### Common Error Codes

| Status | Error                   | Solution                            |
| ------ | ----------------------- | ----------------------------------- |
| 400    | Missing required fields | Verify all form fields are included |
| 401    | Unauthorized            | User must be logged in              |
| 404    | Course not found        | Invalid course slug                 |
| 409    | Already enrolled        | User already has enrollment         |
| 500    | Server error            | Check server logs                   |

---

## Testing the Endpoint

### Using cURL

```bash
curl -X POST http://localhost:3000/api/enrollments \
  -H "Content-Type: application/json" \
  -d '{
    "courseSlug": "ui-ux-fundamentals",
    "phone": "+880 1234567890",
    "currentJob": "Student",
    "careerGoal": "job",
    "address": {
      "division": "Dhaka",
      "district": "Dhaka"
    },
    "payment": {
      "method": "bkash",
      "bkashNumber": "01234567890",
      "transactionId": "8NLKXXXX8"
    }
  }'
```

### Using Postman

1. Create POST request to `http://localhost:3000/api/enrollments`
2. Set Content-Type header to `application/json`
3. Paste the JSON payload above
4. Send request

---

## Environment Variables for API

```env
# Database
MONGODB_URI=mongodb://localhost:27017/my-lms

# Auth
NEXTAUTH_SECRET=your_secret_key
NEXTAUTH_URL=http://localhost:3000

# Email Service
RESEND_API_KEY=your_resend_key

# bKash Integration (if using direct API)
BKASH_API_KEY=your_bkash_key
BKASH_API_SECRET=your_bkash_secret
BKASH_MERCHANT_ID=your_merchant_id
COURSE_PRICE=5000  # In smallest currency unit (Taka)

# Admin
ADMIN_EMAIL=admin@example.com
```

---

## Payment Verification Flow

### Manual Verification (Current)

1. Admin receives enrollment in dashboard
2. Admin manually verifies bKash transaction
3. Admin approves/rejects enrollment
4. User receives email notification

### Automated Verification (Future)

1. Call bKash API to verify transaction
2. Compare amount with course price
3. Auto-approve if verified
4. Send instant confirmation email

---

## Webhook for bKash Callback (Future)

```typescript
// POST /api/webhooks/bkash

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { transactionId, status, amount } = body;

    // Verify webhook signature
    const isValid = verifyBkashWebhookSignature(body);

    if (!isValid) {
      return NextResponse.json(
        { success: false, error: "Invalid signature" },
        { status: 401 }
      );
    }

    await connectDB();

    // Update enrollment based on transaction status
    await Enrollment.updateOne(
      { "paymentData.transactionId": transactionId },
      {
        "paymentData.verificationStatus":
          status === "completed" ? "verified" : "failed",
        status: status === "completed" ? "approved" : "rejected",
      }
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}
```

---

## Notes

- All endpoints require authentication via NextAuth.js
- Enrollment status starts as "pending" and requires admin approval
- Payment verification is currently manual (can be automated later)
- Email notifications should be sent on approval/rejection
- Duplicate enrollments are prevented by unique compound index
- All user input is validated before processing

---

Last Updated: November 19, 2025
