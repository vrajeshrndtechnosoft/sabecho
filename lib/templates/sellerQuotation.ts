interface Quotation {
  productName: string;
  averageQty: number | string;
}

export const generateSellerEmailHtml = (
  quotation: Quotation,
): string => {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>New Product Inquiry - Sabecho</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          line-height: 1.6;
          color: #333;
        }
        .container {
          padding: 20px;
          border: 1px solid #e0e0e0;
          border-radius: 10px;
          background-color: #f9f9f9;
          max-width: 600px;
          margin: auto;
        }
        .header {
          background-color: #4CAF50;
          color: white;
          padding: 10px 20px;
          border-radius: 10px 10px 0 0;
        }
        .header p {
          margin: 0;
        }
        .content p {
          margin: 10px 0;
        }
        .content strong {
          color: #4CAF50;
        }
        .footer {
          margin-top: 20px;
          padding: 10px 0;
          text-align: center;
          color: #777;
          border-top: 1px solid #e0e0e0;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <p>Dear Seller,</p>
        </div>
        <div class="content">
          <p>A new product inquiry has been received for your product:</p>
          <p><strong>Product Name:</strong> ${quotation.productName}</p>
          <p><strong>Average Quantity:</strong> ${quotation.averageQty}</p>
          <p>Please <a href="${process.env.BASE_URL}/seller/dashboard/quotation">Check</a> the Details.</p>
          <p>Thank you,</p>
          <p>Sabecho</p>
        </div>
        <div class="footer">
          <p>&copy; ${new Date().getFullYear()} Sabecho. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};
