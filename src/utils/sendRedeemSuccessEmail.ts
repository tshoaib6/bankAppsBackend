import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const sendRedeemSuccessEmail = async (
  email: string,
  receiptCode: string,
  userName?: string
): Promise<void> => {
  const mailOptions = {
    from: `"Banks Team" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Redeem Successful - Collect Your Premium",
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8" />
          <title>Redeem Successful</title>
        </head>
        <body style="font-family: Arial, sans-serif; background: #f9f9f9; padding: 0; margin: 0;">
          <table align="center" border="0" cellpadding="0" cellspacing="0" width="600" 
            style="background: #ffffff; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); margin: 20px auto; padding: 0px;">
            
            <tr>
              <td align="center" style="padding: 20px 0;">
                <h1 style="color: #2d89ef; margin: 0;">Redeem Successful!</h1>
              </td>
            </tr>

            <tr>
              <td style="padding: 20px; color: #333; font-size: 16px;">
                <p>Hi <strong>${userName || "Valued User"}</strong>,</p>
                <p>Thank you for redeeming this premium.</p>
                <p>
                  Please visit <strong>Banks Barbados Breweries</strong> at 
                  <em>Newton Christ Church</em> on 
                  <strong>Tuesday, Wednesday, or Thursday between 10 am to 2 pm</strong> 
                  to collect your premium.
                </p>
                <p>
                  Please show your receipt code to the team when collecting your item:
                </p>

                <div style="margin: 20px 0; text-align: center;">
                  <span style="font-size: 22px; font-weight: bold; color: #ffffff; background: #2d89ef; padding: 12px 24px; border-radius: 8px; display: inline-block; letter-spacing: 2px;">
                    ${receiptCode}
                  </span>
                </div>
              </td>
            </tr>

            <tr>
              <td align="center" style="padding: 5px; color: #777; font-size: 14px; border-top: 1px solid #eee;">
                <p>Thank you,<br/>Banks Team</p>
              </td>
            </tr>
          </table>
        </body>
      </html>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("✅ Redeem success email sent successfully");
  } catch (error) {
    console.error("❌ Error sending redeem success email:", error);
    throw new Error("Failed to send redeem success email");
  }
};

