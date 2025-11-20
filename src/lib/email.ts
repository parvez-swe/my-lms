import nodemailer from "nodemailer";
import { Course } from "@/data/courses";

// Create transporter with proper error handling
const getTransporter = () => {
  // Check if SMTP credentials are configured
  if (!process.env.SMTP_USER || !process.env.SMTP_PASSWORD) {
    console.warn(
      "SMTP credentials not configured. Email sending will be disabled."
    );
    return null;
  }

  try {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST || "smtp.gmail.com",
      port: parseInt(process.env.SMTP_PORT || "587"),
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    });
  } catch (error) {
    console.error("Failed to create email transporter:", error);
    return null;
  }
};

export async function sendEnrollmentEmail(
  studentEmail: string,
  studentName: string,
  course: Course
) {
  const mailOptions = {
    from: `"${process.env.SMTP_FROM_NAME || "Learning Platform"}" <${
      process.env.SMTP_USER
    }>`,
    to: studentEmail,
    subject: `Enrollment Request Submitted - ${course.title}`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin-top: 20px; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Enrollment Request Submitted</h1>
            </div>
            <div class="content">
              <p>Hello ${studentName},</p>
              <p>Thank you for your interest in enrolling in <strong>${course.title}</strong>!</p>
              <p>Your enrollment request has been submitted and is currently pending approval from our admin team. We will review your request and notify you via email once a decision has been made.</p>
              <p><strong>Course Details:</strong></p>
              <ul>
                <li>Course: ${course.title}</li>
                <li>Instructor: ${course.tutor}</li>
                <li>Total Lessons: ${course.lessons}</li>
                <li>Price: ${course.price}</li>
              </ul>
              <p>You will receive another email notification once your enrollment is approved.</p>
              <p>Best regards,<br>The Learning Platform Team</p>
            </div>
            <div class="footer">
              <p>This is an automated email. Please do not reply to this message.</p>
            </div>
          </div>
        </body>
      </html>
    `,
  };

  try {
    const transporter = getTransporter();
    if (!transporter) {
      console.warn("Email transporter not available. Skipping email send.");
      return { success: false, error: "Email service not configured" };
    }

    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    console.error("Email sending error:", error);
    return { success: false, error };
  }
}

export async function sendVerificationEmail(
  userEmail: string,
  userName: string,
  verificationToken: string
) {
  const verificationUrl = `${
    process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
  }/authentication/confirm-email?token=${verificationToken}`;

  const mailOptions = {
    from: `"${process.env.SMTP_FROM_NAME || "Learning Platform"}" <${
      process.env.SMTP_USER
    }>`,
    to: userEmail,
    subject: "Verify Your Email Address",
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin-top: 20px; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
            .code { background: #f0f0f0; padding: 10px; border-radius: 5px; font-family: monospace; word-break: break-all; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Verify Your Email Address</h1>
            </div>
            <div class="content">
              <p>Hello ${userName},</p>
              <p>Thank you for registering with us! Please verify your email address by clicking the button below:</p>
              <div style="text-align: center;">
                <a href="${verificationUrl}" class="button">Verify Email Address</a>
              </div>
              <p>Or copy and paste this link into your browser:</p>
              <p class="code">${verificationUrl}</p>
              <p>This link will expire in 24 hours.</p>
              <p>If you didn't create an account, please ignore this email.</p>
              <p>Best regards,<br>The Learning Platform Team</p>
            </div>
            <div class="footer">
              <p>This is an automated email. Please do not reply to this message.</p>
            </div>
          </div>
        </body>
      </html>
    `,
  };

  try {
    const transporter = getTransporter();
    if (!transporter) {
      console.warn("Email transporter not available. Skipping email send.");
      return { success: false, error: "Email service not configured" };
    }

    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    console.error("Email sending error:", error);
    return { success: false, error };
  }
}

export async function sendEnrollmentStatusEmail(
  studentEmail: string,
  studentName: string,
  course: Course,
  status: "approved" | "rejected"
) {
  const isApproved = status === "approved";
  const mailOptions = {
    from: `"${process.env.SMTP_FROM_NAME || "Learning Platform"}" <${
      process.env.SMTP_USER
    }>`,
    to: studentEmail,
    subject: `Enrollment ${isApproved ? "Approved" : "Rejected"} - ${
      course.title
    }`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: ${
              isApproved
                ? "linear-gradient(135deg, #10b981 0%, #059669 100%)"
                : "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)"
            }; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .button { display: inline-block; padding: 12px 30px; background: ${
              isApproved ? "#10b981" : "#ef4444"
            }; color: white; text-decoration: none; border-radius: 5px; margin-top: 20px; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Enrollment ${isApproved ? "Approved" : "Rejected"}</h1>
            </div>
            <div class="content">
              <p>Hello ${studentName},</p>
              ${
                isApproved
                  ? `
                <p>Great news! Your enrollment request for <strong>${
                  course.title
                }</strong> has been <strong>approved</strong>!</p>
                <p>You can now access all course materials and start learning. Click the button below to access your course:</p>
                <a href="${
                  process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
                }/mycourses/${course.slug}" class="button">Access Course</a>
                <p><strong>Course Details:</strong></p>
                <ul>
                  <li>Course: ${course.title}</li>
                  <li>Instructor: ${course.tutor}</li>
                  <li>Total Lessons: ${course.lessons}</li>
                </ul>
                <p>Happy learning!</p>
              `
                  : `
                <p>We regret to inform you that your enrollment request for <strong>${course.title}</strong> has been <strong>rejected</strong>.</p>
                <p>If you believe this is an error or would like to appeal this decision, please contact our support team.</p>
                <p>Thank you for your interest in our platform.</p>
              `
              }
              <p>Best regards,<br>The Learning Platform Team</p>
            </div>
            <div class="footer">
              <p>This is an automated email. Please do not reply to this message.</p>
            </div>
          </div>
        </body>
      </html>
    `,
  };

  try {
    const transporter = getTransporter();
    if (!transporter) {
      console.warn("Email transporter not available. Skipping email send.");
      return { success: false, error: "Email service not configured" };
    }

    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    console.error("Email sending error:", error);
    return { success: false, error };
  }
}

export async function sendInstructorMessage(
  instructorEmail: string,
  studentName: string,
  studentEmail: string,
  courseSlug: string,
  message: string
) {
  const courseUrl = `${
    process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
  }/courses/${courseSlug}`;

  const mailOptions = {
    from: `"${process.env.SMTP_FROM_NAME || "Learning Platform"}" <${
      process.env.SMTP_USER
    }>`,
    to: instructorEmail,
    replyTo: studentEmail,
    subject: `Message from Student - ${courseSlug}`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .message-box { background: white; padding: 20px; border-left: 4px solid #667eea; margin: 20px 0; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>New Student Message</h1>
            </div>
            <div class="content">
              <p>Hello,</p>
              <p>You have received a message from <strong>${studentName}</strong> (${studentEmail}) regarding the course: <strong>${courseSlug}</strong>.</p>
              <div class="message-box">
                <p><strong>Message:</strong></p>
                <p>${message.replace(/\n/g, "<br>")}</p>
              </div>
              <p>You can reply directly to this email to respond to the student.</p>
              <p>View course: <a href="${courseUrl}">${courseUrl}</a></p>
              <p>Best regards,<br>The Learning Platform Team</p>
            </div>
            <div class="footer">
              <p>This is an automated email notification.</p>
            </div>
          </div>
        </body>
      </html>
    `,
  };

  try {
    const transporter = getTransporter();
    if (!transporter) {
      console.warn("Email transporter not available. Skipping email send.");
      return { success: false, error: "Email service not configured" };
    }

    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    console.error("Email sending error:", error);
    return { success: false, error };
  }
}

export async function sendOTPEmail(
  userEmail: string,
  userName: string,
  otp: string
) {
  const mailOptions = {
    from: `"${process.env.SMTP_FROM_NAME || "Learning Platform"}" <${
      process.env.SMTP_USER
    }>`,
    to: userEmail,
    subject: "Your Email Verification OTP",
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .otp-box { background: white; padding: 20px; border: 2px dashed #667eea; border-radius: 8px; text-align: center; margin: 25px 0; }
            .otp-code { font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #667eea; font-family: monospace; }
            .warning { background: #fff3cd; padding: 12px; border-radius: 5px; margin: 15px 0; font-size: 14px; color: #856404; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Email Verification</h1>
            </div>
            <div class="content">
              <p>Hello ${userName},</p>
              <p>Your email verification code is:</p>
              <div class="otp-box">
                <div class="otp-code">${otp}</div>
              </div>
              <p>This code will expire in 10 minutes.</p>
              <div class="warning">
                <strong>⚠️ Security Notice:</strong> Never share this code with anyone. Our team will never ask for your OTP.
              </div>
              <p>If you didn't request this code, please ignore this email or contact support immediately.</p>
              <p>Best regards,<br>The Learning Platform Team</p>
            </div>
            <div class="footer">
              <p>This is an automated email. Please do not reply to this message.</p>
            </div>
          </div>
        </body>
      </html>
    `,
  };

  try {
    const transporter = getTransporter();
    if (!transporter) {
      console.warn("Email transporter not available. Skipping email send.");
      return { success: false, error: "Email service not configured" };
    }

    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    console.error("Email sending error:", error);
    return { success: false, error };
  }
}
