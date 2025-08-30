export interface Book {
  bookTitle: string;
  units: number;
  price: number;
}

export interface PurchaseData {
  books: Book[];
}

export interface User {
  name: string;
}

export const HTML_TEMPLATE = (
  data: PurchaseData,
  totalPrice: number,
  user: User
): string => {
  const booksHtml = data.books.map(book => `
    <tr style="background-color: ${data.books.indexOf(book) % 2 === 0 ? '#ffffff' : '#f7fafc'};">
      <td style="padding: 12px; border-bottom: 1px solid #e2e8f0;">${book.bookTitle}</td>
      <td style="padding: 12px; border-bottom: 1px solid #e2e8f0;">${book.units}</td>
      <td style="padding: 12px; border-bottom: 1px solid #e2e8f0;">$${book.price.toFixed(2)}</td>
    </tr>
  `).join('');

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
        <h2 style="color: #2d3748; font-size: 28px; margin: 0 0 20px 0; font-weight: 600; line-height: 1.3;">Book Purchase Successful!</h2>
        <p style="font-size: 16px; color: #4a5568; margin: 0 0 20px 0; line-height: 1.6;">Dear ${user.name},</p>
        <p style="font-size: 16px; color: #4a5568; margin: 0; line-height: 1.6;">Thank you for purchasing from BookSaga! Below are the details of your order:</p>
      </div>
     
      <!-- Purchase Details -->
      <div style="background-color: #f7fafc; border-radius: 16px; padding: 35px 20px; margin: 40px 0;">
        <p style="color: #718096; font-size: 14px; font-weight: 500; margin: 0 0 15px 0; text-transform: uppercase; letter-spacing: 1px;">Order Details</p>
        <table style="width: 100%; border-collapse: collapse; color: #2d3748; font-size: 16px;">
          <thead>
            <tr style="background: linear-gradient(135deg, #ff6b35, #f7931e); color: #ffffff;">
              <th style="padding: 12px; text-align: left; font-weight: 600; border-radius: 8px 0 0 8px;">Book Title</th>
              <th style="padding: 12px; text-align: left; font-weight: 600;">Quantity</th>
              <th style="padding: 12px; text-align: left; font-weight: 600; border-radius: 0 8px 8px 0;">Price</th>
            </tr>
          </thead>
          <tbody>
            ${booksHtml}
          </tbody>
        </table>
        <p style="font-size: 16px; color: #2d3748; margin: 20px 0 0 0; font-weight: 600; text-align: right;"><strong>Total Price:</strong> $${totalPrice.toFixed(2)}</p>
      </div>
     
      <!-- Additional Info -->
      <div style="margin-top: 35px;">
        <p style="font-size: 15px; color: #4a5568; margin: 0 0 25px 0; line-height: 1.6;">Your book(s) will be shipped to you within 3-5 business days. If you have any questions, please contact our support team.</p>
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