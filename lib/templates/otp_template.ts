// lib/email-template.ts
export const HTML_TEMPLATE = (otp: string): string => {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>OTP Verification - SABECHO</title>
        <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;700&display=swap" rel="stylesheet" />
        <style>
          @media only screen and (max-width: 600px) {
            .container {
              width: 100% !important;
              min-width: auto !important;
            }
            .otp-code {
              font-size: 24px !important;
              padding: 15px !important;
            }
          }
        </style>
    </head>
    <body style="margin: 0; padding: 0; background-color: #f4f4f4;">
      <div class="container" style="font-family: 'Montserrat', Helvetica, Arial, sans-serif; min-width: 600px; max-width: 800px; margin: 0 auto; background-color: #ffffff; overflow: auto; line-height: 1.6;">
        <div style="margin: 0; padding: 40px 30px;">
          <!-- Header -->
          <div style="border-bottom: 2px solid #00466a; padding-bottom: 20px; margin-bottom: 30px;">
            <h1 style="font-size: 28px; color: #00466a; text-decoration: none; font-weight: 700; margin: 0; font-family: 'Montserrat', sans-serif;">SABECHO</h1>
            <p style="color: #666; margin: 5px 0 0 0; font-size: 14px;">Email Verification Service</p>
          </div>
          
          <!-- Main Content -->
          <div style="margin-bottom: 30px;">
            <h2 style="color: #333; font-size: 24px; margin-bottom: 20px; font-weight: 600;">Email Verification Required</h2>
            <p style="font-size: 16px; color: #555; margin-bottom: 20px;">Hi there,</p>
            <p style="font-size: 16px; color: #555; margin-bottom: 25px;">Thank you for choosing SABECHO. Please use the following One-Time Password (OTP) to verify your email address and complete your registration:</p>
            
            <!-- OTP Code -->
            <div style="text-align: center; margin: 30px 0;">
              <div class="otp-code" style="background: linear-gradient(135deg, #00466a, #0066a2); margin: 0 auto; width: max-content; padding: 20px 30px; color: #fff; border-radius: 8px; font-size: 32px; font-weight: 700; letter-spacing: 3px; box-shadow: 0 4px 15px rgba(0, 70, 106, 0.3);">${otp}</div>
            </div>
            
            <!-- Important Notice -->
            <div style="background-color: #fff3cd; border: 1px solid #ffeaa7; border-radius: 6px; padding: 15px; margin: 25px 0;">
              <p style="color: #856404; margin: 0; font-size: 14px;"><strong>⚠️ Important:</strong> This OTP is valid for <strong>5 minutes only</strong>. Do not share this code with anyone for security reasons.</p>
            </div>
            
            <p style="font-size: 16px; color: #555; margin-bottom: 10px;">If you didn't request this verification, please ignore this email or contact our support team.</p>
          </div>
          
          <!-- Footer -->
          <div style="border-top: 1px solid #eee; padding-top: 20px; margin-top: 40px;">
            <p style="font-size: 16px; color: #00466a; margin-bottom: 5px; font-weight: 600;">Best regards,</p>
            <p style="font-size: 16px; color: #00466a; margin-bottom: 20px; font-weight: 600;">The SABECHO Team</p>
            
            <!-- Company Info -->
            <div style="color: #999; font-size: 12px; line-height: 1.4;">
              <p style="margin: 0; font-weight: 600; color: #666;">SABECHO Inc</p>
              <p style="margin: 0;">Chala, Vapi</p>
              <p style="margin: 0;">Gujarat, India</p>
              <p style="margin: 10px 0 0 0;">
                <a href="mailto:info@sabecho.com" style="color: #00466a; text-decoration: none;">info@sabecho.com</a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
};