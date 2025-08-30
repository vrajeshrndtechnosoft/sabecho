// lib/email-template.ts
export const HTML_TEMPLATE = (otp: string): string => {
  return `
    <!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>OTP Verification - SABECHO</title>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
    <style>
      @media only screen and (max-width: 600px) {
        .container {
          width: 100% !important;
          min-width: auto !important;
          margin: 0 !important;
        }
        .content-wrapper {
          padding: 30px 20px !important;
        }
        .otp-code {
          font-size: 28px !important;
          padding: 18px 25px !important;
          letter-spacing: 2px !important;
        }
        .header h1 {
          font-size: 24px !important;
        }
      }
    </style>
</head>
<body style="margin: 0; padding: 0; background-color: #f8f9fa; font-family: 'Inter', system-ui, -apple-system, sans-serif;">
  <div class="container" style="min-width: 600px; max-width: 650px; margin: 40px auto; background-color: #ffffff; border-radius: 12px; box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08); overflow: hidden;">
    
    <!-- Header -->
    <div class="header" style="background: linear-gradient(135deg, #ff6b35 0%, #f7931e 100%); padding: 40px 30px; text-align: left;">
      <h1 style="font-size: 32px; color: #ffffff; margin: 0; font-weight: 700; letter-spacing: -0.5px;">SABECHO</h1>
      <p style="color: rgba(255, 255, 255, 0.9); margin: 8px 0 0 0; font-size: 16px; font-weight: 500;">Email Verification Service</p>
    </div>
   
    <!-- Main Content -->
    <div class="content-wrapper" style="padding: 45px 40px;">
      
      <!-- Welcome Section -->
      <div style="margin-bottom: 35px;">
        <h2 style="color: #2d3748; font-size: 28px; margin: 0 0 20px 0; font-weight: 600; line-height: 1.3;">Verify Your Email Address</h2>
        <p style="font-size: 16px; color: #4a5568; margin: 0 0 20px 0; line-height: 1.6;">Hi there,</p>
        <p style="font-size: 16px; color: #4a5568; margin: 0; line-height: 1.6;">Welcome to SABECHO! To complete your registration and secure your account, please verify your email address using the verification code below:</p>
      </div>
     
      <!-- OTP Code Section -->
      <div style="text-align: center; margin: 40px 0; background-color: #f7fafc; border-radius: 16px; padding: 35px 20px;">
        <p style="color: #718096; font-size: 14px; font-weight: 500; margin: 0 0 15px 0; text-transform: uppercase; letter-spacing: 1px;">Your Verification Code</p>
        <div class="otp-code" style="background: linear-gradient(135deg, #ff6b35, #f7931e); margin: 0 auto; width: max-content; padding: 22px 35px; color: #ffffff; border-radius: 12px; font-size: 36px; font-weight: 700; letter-spacing: 4px; box-shadow: 0 8px 25px rgba(255, 107, 53, 0.3); border: 3px solid #ffffff;">${otp}</div>
        <p style="color: #718096; font-size: 14px; margin: 20px 0 0 0; font-weight: 500;">Enter this code to verify your email</p>
      </div>
     
      <!-- Security Notice -->
      <div style="background: linear-gradient(135deg, #fff5f5, #fef5e7); border-left: 4px solid #f56565; border-radius: 8px; padding: 20px 24px; margin: 35px 0;">
        <div style="display: flex; align-items: flex-start;">
          <div style="color: #e53e3e; font-size: 18px; margin-right: 12px; line-height: 1;">⚠️</div>
          <div>
            <p style="color: #744210; margin: 0; font-size: 15px; font-weight: 600; margin-bottom: 5px;">Security Notice</p>
            <p style="color: #744210; margin: 0; font-size: 14px; line-height: 1.5;">This verification code expires in <strong>5 minutes</strong>. Never share this code with anyone. If you didn't request this verification, please contact our support team immediately.</p>
          </div>
        </div>
      </div>
     
      <!-- Additional Info -->
      <div style="margin-top: 35px;">
        <p style="font-size: 15px; color: #4a5568; margin: 0 0 25px 0; line-height: 1.6;">Having trouble? If you didn't request this verification or need assistance, please don't hesitate to reach out to our support team.</p>
      </div>
    </div>
   
    <!-- Footer -->
    <div style="background-color: #f7fafc; padding: 35px 40px; border-top: 1px solid #e2e8f0;">
      <div style="margin-bottom: 30px;">
        <p style="font-size: 16px; color: #2d3748; margin: 0 0 5px 0; font-weight: 600;">Best regards,</p>
        <p style="font-size: 16px; color: #ff6b35; margin: 0; font-weight: 700;">The SABECHO Team</p>
      </div>
     
      <!-- Company Info -->
      <div style="border-top: 1px solid #e2e8f0; padding-top: 25px;">
        <div style="color: #718096; font-size: 13px; line-height: 1.6;">
          <p style="margin: 0; font-weight: 600; color: #2d3748; font-size: 14px;">SABECHO Inc</p>
          <p style="margin: 5px 0 0 0;">Chala, Vapi, Gujarat, India</p>
          <p style="margin: 15px 0 0 0;">
            <a href="mailto:info@sabecho.com" style="color: #ff6b35; text-decoration: none; font-weight: 500; transition: color 0.2s;">info@sabecho.com</a>
          </p>
        </div>
      </div>
    </div>
  </div>
</body>
</html>
  `;
};  