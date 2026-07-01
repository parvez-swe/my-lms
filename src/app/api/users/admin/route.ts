import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getDatabase } from "@/lib/mongodb";
import { UserDocument, UserRole } from "@/models/User";
import { canAssignRole, isAdminRole as rbacIsAdmin } from "@/lib/rbac";
import { sendTempPasswordEmail } from "@/lib/email";
import { serializeDocument } from "@/lib/serialize";
import bcrypt from "bcryptjs";
import { Filter, ObjectId } from "mongodb";
import crypto from "crypto";

export const dynamic = "force-dynamic";

const ALL_ROLES: UserRole[] = [
  "student",
  "teacher",
  "marketer",
  "admin",
  "superadmin",
  "mentor",
];

function isAdmin(role?: string): boolean {
  return rbacIsAdmin(role);
}

function sanitizeUser(user: UserDocument) {
  const {
    password: _password,
    otp: _otp,
    otpExpiry: _otpExpiry,
    otpAttempts: _otpAttempts,
    emailVerificationToken: _token,
    emailVerificationTokenExpiry: _tokenExpiry,
    ...safe
  } = user;

  return serializeDocument({
    ...safe,
    _id: user._id?.toString(),
    verified: Boolean(user.emailVerified),
  });
}

async function requireAdmin() {
  const session = await auth();
  if (!session?.user) {
    return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }
  if (!isAdmin(session.user.role)) {
    return { error: NextResponse.json({ error: "Forbidden" }, { status: 403 }) };
  }
  return { session };
}

// GET — list users with pagination and filters
export async function GET(request: NextRequest) {
  /* auth-guarded */
  const authResult = await requireAdmin();
  if (authResult.error) return authResult.error;

  try {
    const { searchParams } = request.nextUrl;
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(
      100,
      Math.max(1, parseInt(searchParams.get("limit") || "20", 10))
    );
    const search = searchParams.get("search")?.trim() || "";
    const role = searchParams.get("role") || "";
    const status = searchParams.get("status") || "";

    const andConditions: Filter<UserDocument>[] = [
      {
        $or: [{ deletedAt: { $exists: false } }, { deletedAt: null }],
      } as Filter<UserDocument>,
    ];

    if (search) {
      const regex = { $regex: search, $options: "i" };
      andConditions.push({ $or: [{ email: regex }, { name: regex }] });
    }

    if (role && ALL_ROLES.includes(role as UserRole)) {
      andConditions.push({ role: role as UserRole });
    }

    if (status === "verified") {
      andConditions.push({
        emailVerified: { $exists: true, $ne: null } as unknown as Date,
      });
    } else if (status === "unverified") {
      andConditions.push({
        $or: [{ emailVerified: { $exists: false } }, { emailVerified: null }],
      } as Filter<UserDocument>);
    }

    const query: Filter<UserDocument> = { $and: andConditions };

    const db = await getDatabase();
    const collection = db.collection<UserDocument>("users");

    const [users, total] = await Promise.all([
      collection
        .find(query)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .toArray(),
      collection.countDocuments(query),
    ]);

    return NextResponse.json({
      users: users.map(sanitizeUser),
      total,
      page,
      totalPages: Math.ceil(total / limit) || 1,
    });
  } catch (error) {
    console.error("Failed to fetch users:", error);
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 }
    );
  }
}

// PATCH — admin user actions
export async function PATCH(request: NextRequest) {
  /* auth-guarded */
  const authResult = await requireAdmin();
  if (authResult.error) return authResult.error;
  const { session } = authResult;

  try {
    const body = await request.json();
    const { userId, action, value } = body as {
      userId?: string;
      action?: "change-role" | "toggle-status" | "delete" | "reset-password";
      value?: string;
    };

    if (!userId || !ObjectId.isValid(userId)) {
      return NextResponse.json({ error: "Invalid user ID" }, { status: 400 });
    }

    if (userId === session!.user.id) {
      return NextResponse.json(
        { error: "You cannot perform this action on your own account" },
        { status: 400 }
      );
    }

    const db = await getDatabase();
    const user = await db.collection<UserDocument>("users").findOne({
      _id: new ObjectId(userId),
      $or: [{ deletedAt: { $exists: false } }, { deletedAt: null }],
    } as Filter<UserDocument>);

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const isSuperAdmin = session!.user.role === "superadmin";

    if (user.role === "superadmin" && !isSuperAdmin) {
      return NextResponse.json(
        { error: "Only superadmin can modify superadmin accounts" },
        { status: 403 }
      );
    }

    if (action === "change-role") {
      if (!value || !ALL_ROLES.includes(value as UserRole)) {
        return NextResponse.json({ error: "Invalid role" }, { status: 400 });
      }

      const newRole = value as UserRole;
      if (!canAssignRole(session.user.role, newRole)) {
        return NextResponse.json(
          { error: "You cannot assign this role" },
          { status: 403 }
        );
      }

      await db.collection<UserDocument>("users").updateOne(
        { _id: new ObjectId(userId) },
        { $set: { role: newRole, updatedAt: new Date() } }
      );
    } else if (action === "toggle-status") {
      const isVerified = Boolean(user.emailVerified);
      if (isVerified) {
        await db.collection<UserDocument>("users").updateOne(
          { _id: new ObjectId(userId) },
          {
            $unset: { emailVerified: "" },
            $set: { updatedAt: new Date() },
          }
        );
      } else {
        await db.collection<UserDocument>("users").updateOne(
          { _id: new ObjectId(userId) },
          {
            $set: { emailVerified: new Date(), updatedAt: new Date() },
          }
        );
      }
    } else if (action === "delete") {
      await db.collection<UserDocument>("users").updateOne(
        { _id: new ObjectId(userId) },
        { $set: { deletedAt: new Date(), updatedAt: new Date() } }
      );
    } else if (action === "reset-password") {
      const tempPassword = crypto
        .randomBytes(4)
        .toString("hex")
        .slice(0, 10);
      const hashedPassword = await bcrypt.hash(tempPassword, 10);

      await db.collection<UserDocument>("users").updateOne(
        { _id: new ObjectId(userId) },
        { $set: { password: hashedPassword, updatedAt: new Date() } }
      );

      await sendTempPasswordEmail(user.email, user.name, tempPassword);
    } else {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    const updated = await db.collection<UserDocument>("users").findOne({
      _id: new ObjectId(userId),
    });

    return NextResponse.json({
      success: true,
      user: updated ? sanitizeUser(updated) : null,
    });
  } catch (error) {
    console.error("Failed to update user:", error);
    return NextResponse.json(
      { error: "Failed to update user" },
      { status: 500 }
    );
  }
}
