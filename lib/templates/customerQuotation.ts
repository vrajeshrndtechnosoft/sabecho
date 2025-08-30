export interface Quotation {
  productName?: string;
  commission?: string;
  negotiation?: string;
  minQty?: string;
  hsnCode?: string;
  gstPercentage?: number;
  pid?: string;
  amount?: string;
  description?: string;
  company?: string;
  pincode?: string;
  buyer_email?: string;
  mobile?: string;
}

export const generateCustomerQuotationHtml = (quotation: Quotation): string => {
  return `
    <!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Customer Quotation - SABECHO</title>
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
      <p style="color: rgba台湾, 255, 255, 0.9); margin: 8px 0 0 0; font-size: 16px; font-weight: 500;">Customer Quotation</p>
    </div>
   
    <!-- Main Content -->
    <div class="content-wrapper" style="padding: 45px 40px;">
      
      <!-- Quotation Section -->
      <div style="margin-bottom: 35px;">
        <h2 style="color: #2d3748; font-size: 28px; margin: 0 0 20px 0; font-weight: 600; line-height: 1.3;">Quotation Details</h2>
        <p style="font-size: 16px; color: #4a5568; margin: 0 0 20px 0; line-height: 1.6;">Dear Customer,</p>
        <p style="font-size: 16px; color: #4a5568; margin: 0; line-height: 1.6;">Thank you for choosing SABECHO. Below are the details of your quotation:</p>
      </div>
     
      <!-- Quotation Details -->
      <div style="background-color: #f7fafc; border-radius: 16px; padding: 35px 20px; margin: 40px 0;">
        <p style="color: #718096; font-size: 14px; font-weight: 500; margin: 0 0 15px 0; text-transform: uppercase; letter-spacing: 1px;">Quotation Information</p>
        <div style="color: #2d3748; font-size: 16px; line-height: 1.6;">
          <p style="margin: 10px 0;"><strong>Product Name:</strong> ${quotation?.productName || 'N/A'}</p>
          <p style="margin: 10px 0;"><strong>Commission:</strong> ${quotation?.commission || 'N/A'}</p>
          <p style="margin: 10px 0;"><strong>Negotiation:</strong> ${quotation?.negotiation || 'N/A'}</p>
          <p style="margin: 10px 0;"><strong>Minimum Quantity:</strong> ${quotation?.minQty || 'N/A'}</p>
          <p style="margin: 10px 0;"><strong>HSN Code:</strong> ${quotation?.hsnCode || 'N/A'}</p>
          <p style="margin: 10px 0;"><strong>GST Percentage:</strong> ${quotation?.gstPercentage !== undefined ? quotation.gstPercentage + '%' : 'N/A'}</p>
          <p style="margin: 10px 0;"><strong>Product ID:</strong> ${quotation?.pid || 'N/A'}</p>
          <p style="margin: 10px 0;"><strong>Amount:</strong> ${quotation?.amount || 'N/A'}</p>
          <p style="margin: 10px 0;"><strong>Description:</strong> ${quotation?.description || 'N/A'}</p>
          <p style="margin: 10px 0;"><strong>Company:</strong> ${quotation?.company || 'N/A'}</p>
          <p style="margin: 10px 0;"><strong>Pincode:</strong> ${quotation?.pincode || 'N/A'}</p>
          <p style="margin: 10px 0;"><strong>Buyer Email:</strong> ${quotation?.buyer_email || 'N/A'}</p>
          <p style="margin: 10px 0;"><strong>Mobile:</strong> ${quotation?.mobile || 'N/A'}</p>
        </div>
      </div>
     
      <!-- Additional Info -->
      <div style="margin-top: 35px;">
        <p style="font-size: 15px; color: #4a5568; margin: 0 0 25px 0; line-height: 1.6;">If you have any questions or need further assistance, please feel free to contact our support team.</p>
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