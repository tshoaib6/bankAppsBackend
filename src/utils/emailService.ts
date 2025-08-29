// import nodemailer from 'nodemailer';

// const transporter = nodemailer.createTransport({
//   service: 'gmail',
//   auth: {
//     user: process.env.EMAIL_USER, 
//     pass: process.env.EMAIL_PASS,
//   },
// });

// export const sendVerificationEmail = async (email: string, verificationToken: string): Promise<void> => {
//   const verificationUrl = `http://yourdomain.com/verify-email?token=${verificationToken}`; // Replace with your front-end URL

//   const mailOptions = {
//     from: process.env.EMAIL_USER,
//     to: email,
//     subject: 'Email Verification', 
//     text: `Please click the following link to verify your email: ${verificationUrl}`,
//     html: `<p>Please click the following link to verify your email: <a href="${verificationUrl}">${verificationUrl}</a></p>`,
//   };

//   try {
//     await transporter.sendMail(mailOptions);
//     console.log('Verification email sent successfully');
//   } catch (error) {
//     console.error('Error sending verification email:', error);
//     throw new Error('Failed to send verification email');
//   }
// };
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// export const sendVerificationEmail = async (
//   email: string,
//   verificationCode: string
// ): Promise<void> => {
//   const mailOptions = {
//     from: process.env.EMAIL_USER,
//     to: email,
//     subject: "Email Verification Code",
//     text: `Your email verification code is: ${verificationCode}. This code will expire in 10 minutes.`,
//     html: `
//       <p>Hello,</p>
//       <p>Your email verification code is:</p>
//       <h2 style="letter-spacing: 4px;">${verificationCode}</h2>
//       <p>This code will expire in <strong>10 minutes</strong>. If you did not request this, please ignore this email.</p>
//     `,
//   };

//   try {
//     await transporter.sendMail(mailOptions);
//     console.log("Verification email sent successfully");
//   } catch (error) {
//     console.error("Error sending verification email:", error);
//     throw new Error("Failed to send verification email");
//   }
// };



export const sendVerificationEmail = async (
  email: string,
  verificationCode: string,
  userName?: string // ✅ so we can greet the user by name
): Promise<void> => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "✅ Your Email Verification Code", // ✅ updated subject
    text: `Hi ${userName || "User"},
Your one-time verification code is:

${verificationCode}

This code is valid for 10 minutes.
If you did not request this code, please disregard this email.

Thank you,
BanksBeer Promotion Team`,
    html: `
      <p>Hi <strong>${userName || "User"}</strong>,</p>
      <p>Your one-time verification code is:</p>
      <h2 style="letter-spacing: 4px;">🎯 ${verificationCode}</h2>
      <p>This code is valid for <strong>10 minutes</strong>.</p>
      <p>If you did not request this code, please disregard this email.</p>
      <br />
      <p>Thank you,<br/>Banks Team</p>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("Verification email sent successfully");
  } catch (error) {
    console.error("Error sending verification email:", error);
    throw new Error("Failed to send verification email");
  }
};
