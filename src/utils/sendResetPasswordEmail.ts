import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const sendResetPasswordEmail = async (
  email: string,
  otpCode: string,
  userName?: string
): Promise<void> => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "🔐 Your Password Reset OTP Code",
    text: `Hi ${userName || "User"},

We received a request to reset your password.

Your one-time password (OTP) to reset your account is: ${otpCode}

This code is valid for 10 minutes.
If you did not request a password reset, please ignore this email.

Thank you,
Banks Team`,
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.5; color: #333;">
        <p>Hi <strong>${userName || "User"}</strong>,</p>
        <p>We received a request to reset your password.</p>
        <p>Your one-time password (OTP) is:</p>
        <h2 style="letter-spacing: 4px; color: #2d89ef;">🔐 ${otpCode}</h2>
        <p>This code is valid for <strong>10 minutes</strong>.</p>
        <p>If you did not request a password reset, please ignore this email.</p>
        <br/>
        <p>Thank you,<br/>Banks Team</p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("✅ Reset password email sent successfully");
  } catch (error) {
    console.error("❌ Error sending reset password email:", error);
    throw new Error("Failed to send reset password email");
  }
};
