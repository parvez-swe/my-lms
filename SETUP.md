# Learning Platform Setup Guide

## Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```env
# MongoDB
MONGODB_URI=mongodb://localhost:27017/learning-platform
MONGODB_DB_NAME=learning-platform

# NextAuth (REQUIRED - Application will fail without these)
NEXTAUTH_SECRET=your-secret-key-here-generate-with-openssl-rand-base64-32
NEXTAUTH_URL=http://localhost:3000

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Cloudinary (for video uploads)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Email (Nodemailer - SMTP) - OPTIONAL but recommended
# If not configured, registration will still work but verification emails won't be sent
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
SMTP_FROM_NAME=Learning Platform

# For Gmail, you need to:
# 1. Enable 2-Step Verification
# 2. Generate an App Password: https://myaccount.google.com/apppasswords
# 3. Use the app password (not your regular password) as SMTP_PASSWORD
```

## Generate NextAuth Secret (REQUIRED)

**IMPORTANT:** The application will fail with "Unexpected end of JSON input" error if `NEXTAUTH_SECRET` is not set.

Run this command to generate a secure secret:

```bash
openssl rand -base64 32
```

Copy the output and add it to your `.env.local` file as `NEXTAUTH_SECRET`.

**Example:**

```env
NEXTAUTH_SECRET=abc123xyz789... (your generated secret)
NEXTAUTH_URL=http://localhost:3000
```

If you don't have `openssl`, you can also use Node.js:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

## User Roles

The system supports four user roles:

- **student**: Default role for new registrations
- **mentor**: Can create and manage courses
- **admin**: Can approve/reject enrollments and manage courses
- **superadmin**: Full system access

## Initial Admin User

To create an admin user, you can:

1. Register a new user through `/auth/register` (will be created as "student")
2. Manually update the user role in MongoDB:
   ```javascript
   db.users.updateOne(
     { email: "admin@example.com" },
     { $set: { role: "admin" } }
   );
   ```

Or create a script to seed an admin user:

```javascript
// scripts/seed-admin.js
const bcrypt = require("bcryptjs");
const { MongoClient } = require("mongodb");

async function seedAdmin() {
  const client = new MongoClient(process.env.MONGODB_URI);
  await client.connect();
  const db = client.db(process.env.MONGODB_DB_NAME);

  const hashedPassword = await bcrypt.hash("admin123", 10);

  await db.collection("users").insertOne({
    email: "admin@example.com",
    password: hashedPassword,
    name: "Admin User",
    role: "admin",
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  console.log("Admin user created!");
  await client.close();
}

seedAdmin();
```

## Features Implemented

### Authentication

- ✅ NextAuth integration with credentials provider
- ✅ User registration and login
- ✅ Role-based access control (student, mentor, admin, superadmin)
- ✅ Protected routes middleware

### Enrollment System

- ✅ Course enrollment requests
- ✅ Admin approval/rejection workflow
- ✅ Email notifications on enrollment creation
- ✅ Email notifications on status updates (approved/rejected)
- ✅ Enrollment status tracking

### Course Management

- ✅ Full CRUD operations for courses
- ✅ Video upload support (YouTube, Cloudinary, direct URLs)
- ✅ Lesson privacy settings (public/private)
- ✅ Progress tracking per user
- ✅ Course curriculum with module/lesson structure

### Protected Routes

- ✅ `/dashboard/*` routes protected for admin and superadmin only
- ✅ `/mycourses/*` routes require authentication and approved enrollment

### Email Notifications

- ✅ Enrollment request confirmation email
- ✅ Enrollment approval email
- ✅ Enrollment rejection email

## API Routes

### Authentication

- `POST /api/auth/[...nextauth]` - NextAuth handler
- `POST /api/users/register` - User registration

### Courses

- `GET /api/courses` - Get all courses
- `POST /api/courses` - Create course
- `GET /api/courses/[id]` - Get single course
- `PUT /api/courses/[id]` - Update course
- `DELETE /api/courses/[id]` - Delete course

### Enrollments

- `GET /api/enrollments` - Get user's enrollments
- `POST /api/enrollments` - Create enrollment request
- `GET /api/enrollments/[id]` - Get single enrollment
- `PUT /api/enrollments/[id]` - Update enrollment status (admin only)
- `GET /api/enrollments/course/[slug]` - Get enrollment for course
- `GET /api/enrollments/admin` - Get all enrollments (admin only)

### Progress

- `PUT /api/progress` - Update lesson progress

### Upload

- `POST /api/upload/video` - Upload video to Cloudinary

## Testing the System

1. **Register a student user:**

   - Go to `/auth/register`
   - Create an account (defaults to "student" role)

2. **Create an admin user:**

   - Use MongoDB to update a user's role to "admin"

3. **Enroll in a course:**

   - Browse courses at `/courses`
   - Click on a course
   - Click "Enroll Now"
   - Submit enrollment request

4. **Approve enrollment (as admin):**

   - Go to `/dashboard` (admin only)
   - Navigate to enrollments management
   - Approve/reject enrollment requests
   - Student will receive email notification

5. **Access enrolled course:**
   - Go to `/mycourses/[slug]`
   - View course curriculum
   - Click on lessons to view content
   - Progress is automatically tracked

## Notes

- All API routes use `export const dynamic = "force-dynamic"` to ensure server-side rendering
- Dashboard routes are protected by middleware
- Enrollment status must be "approved" to access course content
- Lesson progress is tracked using format: `"moduleIndex-lessonIndex"`
