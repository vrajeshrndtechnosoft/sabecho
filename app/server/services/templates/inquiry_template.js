const HTML_TEMPLATE = (user, inquiryDetails, recipientType) => {
  const containerStyle = `max-width: 800px; margin: 0 auto; text-align: center; padding: 20px;`;

  const adminContent = `
      <h1>New Product Inquiry</h1>
      <p>Dear Team,</p>
      <p>A new product inquiry has been received with the following details:</p>
      <table>
        <thead>
          <tr>
            <th>Field</th>
            <th>Details</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Name</td>
            <td>${inquiryDetails.name}</td>
          </tr>
          <tr>
            <td>Minimum Quantity</td>
            <td>${inquiryDetails.minQty}</td>
          </tr>
          <tr>
            <td>Company</td>
            <td>${inquiryDetails.company}</td>
          </tr>
          <tr>
            <td>Pincode</td>
            <td>${inquiryDetails.pincode}</td>
          </tr>
          <tr>
            <td>GST Number</td>
            <td>${inquiryDetails.gstNo || "N/A"}</td>
          </tr>
          <tr>
            <td>Email</td>
            <td>${inquiryDetails.email}</td>
          </tr>
          <tr>
            <td>Mobile</td>
            <td>${inquiryDetails.mobile}</td>
          </tr>
          <tr>
            <td>User Type</td>
            <td>${inquiryDetails.userType}</td>
          </tr>
        </tbody>
      </table>
      <p className="text-center">Best regards,</p>
      <p className="text-center">The Sabecho Team</p>
    `;

  const userContent = `
      <h1>Thank You for Your Inquiry</h1>
      <p>Dear ${user.name},</p>
      <p>Thank you for your inquiry. Here are the details you provided:</p>
      <table>
        <thead>
          <tr>
            <th>Field</th>
            <th>Details</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Product Name</td>
            <td>${inquiryDetails.name}</td>
          </tr>
          <tr>
            <td>Minimum Quantity</td>
            <td>${inquiryDetails.minQty}</td>
          </tr>
          <tr>
            <td>Company</td>
            <td>${inquiryDetails.company}</td>
          </tr>
          <tr>
            <td>Pincode</td>
            <td>${inquiryDetails.pincode}</td>
          </tr>
          <tr>
            <td>GST Number</td>
            <td>${inquiryDetails.gstNo || "N/A"}</td>
          </tr>
          <tr>
            <td>Email</td>
            <td>${inquiryDetails.email}</td>
          </tr>
          <tr>
            <td>Mobile</td>
            <td>${inquiryDetails.mobile}</td>
          </tr>
          <tr>
            <td>User Type</td>
            <td>${inquiryDetails.userType}</td>
          </tr>
        </tbody>
      </table>
      <p>We will get back to you shortly with more details.</p>
      <p className="text-center">Best regards,</p>
      <p className="text-center">The Sabecho Team</p>
    `;

  return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${
          recipientType === "admin"
            ? "New Product Inquiry"
            : "Thank You for Your Inquiry"
        } - Sabecho</title>
        <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;700&display=swap" rel="stylesheet">
        <style>
          body {
            font-family: 'Montserrat', sans-serif;
            line-height: 1.6;
            color: #333;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
          }
          th, td {
            border: 1px solid #dddddd;
            text-align: left;
            padding: 8px;
          }
          th {
            background-color: #f2f2f2;
          }
          h1 {
            text-align: center;
            color: #4a86e8;
          }
          p {
            margin-bottom: 10px;
          }
          .text-center {
            text-align: center;
          }
        </style>
      </head>
      <body>
        <div style="${containerStyle}">
          ${recipientType === "admin" ? adminContent : userContent}
        </div>
      </body>
      </html>
    `;
};

module.exports = HTML_TEMPLATE;
