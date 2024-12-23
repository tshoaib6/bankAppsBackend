import nodemailer from 'nodemailer';


const transporter = nodemailer.createTransport({
  service: 'Gmail',  
  auth: {
    user: process.env.EMAIL_USER,  
    pass: process.env.EMAIL_PASS,  
  },
});

// Helper function to send emails
export const sendEmail = async (to: string, subject: string, text: string): Promise<void> => {
  const mailOptions = {
    from: process.env.EMAIL_USER,  
    to,                            
    subject,                      
    text,                          
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Email sent successfully to ' + to);
  } catch (error) {
    console.error('Error sending email:', error);
    throw new Error('Email sending failed.');
  }
};
