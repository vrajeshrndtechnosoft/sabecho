interface ReceiptMailProps {
  customerName: string;
  orderNumber: string;
  orderDate: string;
  totalAmount: string;
  shippingAddress: string;
  items: {
    name: string;
    quantity: number;
    price: string;
    total: string;
  }[];
  subtotal: string;
  shipping: string;
  total: string;
}

export const HTML_TEMPLATE = ({
  customerName,
  orderNumber,
  orderDate,
  totalAmount,
  shippingAddress,
  items,
  subtotal,
  shipping,
  total,
}: ReceiptMailProps): string => {
  const itemsHtml = items
    .map(
      (item) => `
        <tr style="background-color: ${items.indexOf(item) % 2 === 0 ? '#ffffff' : '#f7fafc'};">
          <td style="padding: 12px; border-bottom: 1px solid #e2e8f0;">${item.name}</td>
          <td style="padding: 12px; border-bottom: 1px solid #e2e8f0;">${item.quantity}</td>
          <td style="padding: 12px; border-bottom: 1px solid #e2e8f0;">${item.price}</td>
          <td style="padding: 12px; border-bottom: 1px solid #e2e8f0;">${item.total}</td>
        </tr>
      `
    )
    .join('');

  return `
    <!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Book Purchase Successful - BookSaga</title>
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
      <div style="display: flex; align-items: center;">
        <img loading="lazy" title="booksaga" src="https://i.ibb.co/ySXpJbr/logo.jpg" width="80" height="80" alt="BookSaga Logo" style="margin-right: 15px;" />
        <div>
          <h1 style="font-size: 32px; color: #ffffff; margin: 0; font-weight: 700; letter-spacing: -0.5px;">BookSaga</h1>
          <p style="color: rgba(255, 255, 255, 0.9); margin: 8px 0 0 0; font-size: 16px; font-weight: 500;">Purchase Confirmation</p>
        </div>
      </div>
    </div>
   
    <!-- Main Content -->
    <div class="content-wrapper" style="padding: 45px 40px;">
      
      <!-- Purchase Section -->
      <div style="margin-bottom: 35px;">
        <h2 style="color: #2d3748; font-size: 28px; margin: 0 0 20px 0; font-weight: 600; line-height: 1.3;">Thank You for Your Purchase!</h2>
        <p style="font-size: 16px; color: #4a5568; margin: 0 0 20px 0; line-height: 1.6;">Dear ${customerName},</p>
        <p style="font-size: 16px; color: #4a5568; margin: 0; line-height: 1.6;">We are pleased to confirm that your purchase has been successfully processed. Your order details are as follows:</p>
      </div>
     
      <!-- Order Details -->
      <div style="background-color: #f7fafc; border-radius: 16px; padding: 35px 20px; margin: 40px 0;">
        <p style="color: #718096; font-size: 14px; font-weight: 500; margin: 0 0 15px 0; text-transform: uppercase; letter-spacing: 1px;">Order Information</p>
        <div style="color: #2d3748; font-size: 16px; line-height: 1.6;">
          <p style="margin: 10px 0;"><strong>Order Number:</strong> ${orderNumber}</p>
          <p style="margin: 10px 0;"><strong>Order Date:</strong> ${orderDate}</p>
          <p style="margin: 10px 0;"><strong>Total Amount:</strong> ${totalAmount}</p>
          <p style="margin: 10px 0;"><strong>Shipping Address:</strong> ${shippingAddress}</p>
        </div>
      </div>
      
      <!-- Bill Section -->
      <div style="background-color: #f7fafc; border-radius: 16px; padding: 35px 20px; margin: 40px 0;">
        <p style="color: #718096; font-size: 14px; font-weight: 500; margin: 0 0 15px 0; text-transform: uppercase; letter-spacing: 1px;">Bill Details</p>
        <table style="width: 100%; border-collapse: collapse; color: #2d3748; font-size: 16px;">
          <thead>
            <tr style="background: linear-gradient(135deg, #ff6b35, #f7931e); color: #ffffff;">
              <th style="padding: 12px; text-align: left; font-weight: 600; border-radius: 8px 0 0 8px;">Item</th>
              <th style="padding: 12px; text-align: left; font-weight: 600;">Quantity</th>
              <th style="padding: 12px; text-align: left; font-weight: 600;">Price</th>
              <th style="padding: 12px; text-align: left; font-weight: 600; border-radius: 0 8px 8px 0;">Total</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
          <tfoot>
            <tr style="background-color: #ffffff;">
              <td colspan="3" style="padding: 12px; border-bottom: 1px solid #e2e8f0; font-weight: 600;">Subtotal:</td>
              <td style="padding: 12px; border-bottom: 1px solid #e2e8f0;">${subtotal}</td>
            </tr>
            <tr style="background-color: #f7fafc;">
              <td colspan="3" style="padding: 12px; border-bottom: 1px solid #e2e8f0; font-weight: 600;">Shipping:</td>
              <td style="padding: 12px; border-bottom: 1px solid #e2e8f0;">${shipping}</td>
            </tr>
            <tr style="background-color: #ffffff;">
              <td colspan="3" style="padding: 12px; font-weight: 600;"><strong>Total:</strong></td>
              <td style="padding: 12px; font-weight: 600;"><strong>${total}</strong></td>
            </tr>
          </tfoot>
        </table>
      </div>
     
      <!-- Additional Info -->
      <div style="margin-top: 35px;">
        <p style="font-size: 15px; color: #4a5568; margin: 0 0 25px 0; line-height: 1.6;">Your order will be shipped within 3–5 business days. If you have any questions or concerns, please contact our support team.</p>
      </div>
    </div>
   
    <!-- Footer -->
    <div style="background-color: #f7fafc; padding: 35px 40px; border-top: 1px solid #e2e8f0;">
      <div style="margin-bottom: 30px;">
        <p style="font-size: 16px; color: #2d3748; margin: 0 0 5px 0; font-weight: 600;">Best regards,</p>
        <p style="font-size: 16px; color: #ff6b35; margin: 0; font-weight: 700;">The BookSaga Team</p>
      </div>
     
      <!-- Company Info -->
      <div style="border-top: 1px solid #e2e8f0; padding-top: 25px;">
        <div style="color: #718096; font-size: 13px; line-height: 1.6;">
          <p style="margin: 0; font-weight: 600; color: #2d3748; font-size: 14px;">BookSaga Inc</p>
          <p style="margin: 5px 0 0 0;">Chala, Vapi, Gujarat, India</p>
          <p style="margin: 15px 0 0 0;">
            <a href="mailto:support@booksaga.com" style="color: #ff6b35; text-decoration: none; font-weight: 500; transition: color 0.2s;">support@booksaga.com</a>
          </p>
        </div>
      </div>
    </div>
  </div>
</body>
</html>
  `;
};