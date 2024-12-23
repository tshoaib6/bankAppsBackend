import nodemailer from 'nodemailer';

// Create a transporter object using SMTP
const transporter = nodemailer.createTransport({
  service: 'gmail', // or use another service like SendGrid, Mailgun, etc.
  auth: {
    user: process.env.EMAIL_USER, // Your email (make sure to store this in an environment variable)
    pass: process.env.EMAIL_PASS, // Your email password (also stored in an env var)
  },
});

// Function to send a verification email
export const sendVerificationEmail = async (email: string, verificationToken: string): Promise<void> => {
  const verificationUrl = `http://yourdomain.com/verify-email?token=${verificationToken}`; // Replace with your front-end URL

  const mailOptions = {
    from: process.env.EMAIL_USER, // Sender address
    to: email, // Recipient address
    subject: 'Email Verification', // Subject line
    text: `Please click the following link to verify your email: ${verificationUrl}`,
    html: `<p>Please click the following link to verify your email: <a href="${verificationUrl}">${verificationUrl}</a></p>`,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Verification email sent successfully');
  } catch (error) {
    console.error('Error sending verification email:', error);
    throw new Error('Failed to send verification email');
  }
};
