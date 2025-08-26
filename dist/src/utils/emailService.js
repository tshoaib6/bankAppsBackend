"use strict";
// import nodemailer from 'nodemailer';
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendVerificationEmail = void 0;
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
const nodemailer_1 = __importDefault(require("nodemailer"));
const transporter = nodemailer_1.default.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});
const sendVerificationEmail = (email, verificationCode) => __awaiter(void 0, void 0, void 0, function* () {
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: "Email Verification Code",
        text: `Your email verification code is: ${verificationCode}. This code will expire in 10 minutes.`,
        html: `
      <p>Hello,</p>
      <p>Your email verification code is:</p>
      <h2 style="letter-spacing: 4px;">${verificationCode}</h2>
      <p>This code will expire in <strong>10 minutes</strong>. If you did not request this, please ignore this email.</p>
    `,
    };
    try {
        yield transporter.sendMail(mailOptions);
        console.log("Verification email sent successfully");
    }
    catch (error) {
        console.error("Error sending verification email:", error);
        throw new Error("Failed to send verification email");
    }
});
exports.sendVerificationEmail = sendVerificationEmail;
