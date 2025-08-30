import { InquiryDetails, RecipientType } from '@/components/types';

interface User {
  name: string;
  email: string;
}

const generateInquiryTemplate = (
  user: User, 
  inquiryDetails: InquiryDetails, 
  recipientType: RecipientType
): string => {
  const adminContent: string = `
      <div style="margin-bottom: 35px;">
        <h2 style="color: #2d3748; font-size: 28px; margin: 0 0 20px 0; font-weight: 600; line-height: 1.3;">New Product Inquiry</h2>
        <p style="font-size: 16px; color: #4a5568; margin: 0 0 20px 0; line-height: 1.6;">Dear Team,</p>
        <p style="font-size: 16px; color: #4a5568; margin: 0; line-height: 1.6;">A new product inquiry has been received with the following details:</p>
      </div>
      <div style="background-color: #f7fafc; border-radius: 16px; padding: 35px 20px; margin: 40px 0;">
        <p style="color: #718096; font-size: 14px; font-weight: 500; margin: 0 0 15px 0; text-transform: uppercase; letter-spacing: 1px;">Inquiry Details</p>
        <table style="width: 100%; border-collapse: collapse; color: #2d3748; font-size: 16px;">
          <thead>
            <tr style="background: linear-gradient(135deg, #ff6b35, #f7931e); color: #ffffff;">
              <th style="padding: 12px; text-align: left; font-weight: 600; border-radius: 8px 0 0 8px;">Field</th>
              <th style="padding: 12px; text-align: left; font-weight: 600; border-radius: 0 8px 8px 0;">Details</th>
            </tr>
          </thead>
          <tbody>
            <tr style="background-color: #ffffff;">
              <td style="padding: 12px; border-bottom: 1px solid #e2e8f0;">Name</td>
              <td style="padding: 12px; border-bottom: 1px solid #e2e8f0;">${inquiryDetails.name || 'N/A'}</td>
            </tr>
            <tr style="background-color: #f7fafc;">
              <td style="padding: 12px; border-bottom: 1px solid #e2e8f0;">Minimum Quantity</td>
              <td style="padding: 12px; border-bottom: 1px solid #e2e8f0;">${inquiryDetails.minQty || 'N/A'}</td>
            </tr>
            <tr style="background-color: #ffffff;">
              <td style="padding: 12px; border-bottom: 1px solid #e2e8f0;">Company</td>
              <td style="padding: 12px; border-bottom: 1px solid #e2e8f0;">${inquiryDetails.company || 'N/A'}</td>
            </tr>
            <tr style="background-color: #f7fafc;">
              <td style="padding: 12px; border-bottom: 1px solid #e2e8f0;">Pincode</td>
              <td style="padding: 12px; border-bottom: 1px solid #e2e8f0;">${inquiryDetails.pincode || 'N/A'}</td>
            </tr>
            <tr style="background-color: #ffffff;">
              <td style="padding: 12px; border-bottom: 1px solid #e2e8f0;">GST Number</td>
              <td style="padding: 12px; border-bottom: 1px solid #e2e8f0;">${inquiryDetails.gstNo || 'N/A'}</td>
            </tr>
            <tr style="background-color: #f7fafc;">
              <td style="padding: 12px; border-bottom: 1px solid #e2e8f0;">Email</td>
              <td style="padding: 12px; border-bottom: 1px solid #e2e8f0;">${inquiryDetails.email || 'N/A'}</td>
            </tr>
            <tr style="background-color: #ffffff;">
              <td style="padding: 12px; border-bottom: 1px solid #e2e8f0;">Mobile</td>
              <td style="padding: 12px; border-bottom: 1px solid #e2e8f0;">${inquiryDetails.mobile || 'N/A'}</td>
            </tr>
            <tr style="background-color: #f7fafc;">
              <td style="padding: 12px; border-bottom: 1px solid #e2e8f0;">User Type</td>
              <td style="padding: 12px; border-bottom: 1px solid #e2e8f0;">${inquiryDetails.userType || 'N/A'}</td>
            </tr>
          </tbody>
        </table>
      </div>
    `;

  const userContent: string = `
      <div style="margin-bottom: 35px;">
        <h2 style="color: #2d3748; font-size: 28px; margin: 0 0 20px 0; font-weight: 600; line-height: 1.3;">Thank You for Your Inquiry</h2>
        <p style="font-size: 16px; color: #4a5568; margin: 0 0 20px 0; line-height: 1.6;">Dear ${user.name},</p>
        <p style="font-size: 16px; color: #4a5568; margin: 0; line-height: 1.6;">Thank you for your inquiry. Here are the details you provided:</p>
      </div>
      <div style="background-color: #f7fafc; border-radius: 16px; padding: 35px 20px; margin: 40px 0;">
        <p style="color: #718096; font-size: 14px; font-weight: 500; margin: 0 0 15px 0; text-transform: uppercase; letter-spacing: 1px;">Inquiry Details</p>
        <table style="width: 100%; border-collapse: collapse; color: #2d3748; font-size: 16px;">
          <thead>
            <tr style="background: linear-gradient(135deg, #ff6b35, #f7931e); color: #ffffff;">
              <th style="padding: 12px; text-align: left; font-weight: 600; border-radius: 8px 0 0 8px;">Field</th>
              <th style="padding: 12px; text-align: left; font-weight: 600; border-radius: 0 8px 8px 0;">Details</th>
            </tr>
          </thead>
          <tbody>
            <tr style="background-color: #ffffff;">
              <td style="padding: 12px; border-bottom: 1px solid #e2e8f0;">Product Name</td>
              <td style="padding: 12px; border-bottom: 1px solid #e2e8f0;">${inquiryDetails.name || 'N/A'}</td>
            </tr>
            <tr style="background-color: #f7fafc;">
              <td style="padding: 12px; border-bottom: 1px solid #e2e8f0;">Minimum Quantity</td>
              <td style="padding: 12px; border-bottom: 1px solid #e2e8f0;">${inquiryDetails.minQty || 'N/A'}</td>
            </tr>
            <tr style="background-color: #ffffff;">
              <td style="padding: 12px; border-bottom: 1px solid #e2e8f0;">Company</td>
              <td style="padding: 12px; border-bottom: 1px solid #e2e8f0;">${inquiryDetails.company || 'N/A'}</td>
            </tr>
            <tr style="background-color: #f7fafc;">
              <td style="padding: 12px; border-bottom: 1px solid #e2e8f0;">Pincode</td>
              <td style="padding: 12px; border-bottom: 1px solid #e2e8f0;">${inquiryDetails.pincode || 'N/A'}</td>
            </tr>
            <tr style="background-color: #ffffff;">
              <td style="padding: 12px; border-bottom: 1px solid #e2e8f0;">GST Number</td>
              <td style="padding: 12px; border-bottom: 1px solid #e2e8f0;">${inquiryDetails.gstNo || 'N/A'}</td>
            </tr>
            <tr style="background-color: #f7fafc;">
              <td style="padding: 12px; border-bottom: 1px solid #e2e8f0;">Email</td>
              <td style="padding: 12px; border-bottom: 1px solid #e2e8f0;">${inquiryDetails.email || 'N/A'}</td>
            </tr>
            <tr style="background-color: #ffffff;">
              <td style="padding: 12px; border-bottom: 1px solid #e2e8f0;">Mobile</td>
              <td style="padding: 12px; border-bottom: 1px solid #e2e8f0;">${inquiryDetails.mobile || 'N/A'}</td>
            </tr>
            <tr style="background-color: #f7fafc;">
              <td style="padding: 12px; border-bottom: 1px solid #e2e8f0;">User Type</td>
              <td style="padding: 12px; border-bottom: 1px solid #e2e8f0;">${inquiryDetails.userType || 'N/A'}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <div style="margin-top: 35px;">
        <p style="font-size: 15px; color: #4a5568; margin: 0 0 25px 0; line-height: 1.6;">We will get back to you shortly with more details.</p>
      </div>
    `;

  return `
    <!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${
      recipientType === "admin"
        ? "New Product Inquiry"
        : "Thank You for Your Inquiry"
    } - SABECHO</title>
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
      <p style="color: rgba(255, 255, 255, 0.9); margin: 8px 0 0 0; font-size: 16px; font-weight: 500;">${
        recipientType === "admin" ? "New Product Inquiry" : "Inquiry Confirmation"
      }</p>
    </div>
   
    <!-- Main Content -->
    <div class="content-wrapper" style="padding: 45px 40px;">
      ${recipientType === "admin" ? adminContent : userContent}
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

export default generateInquiryTemplate;