interface BookItem {
  bookTitle: string;
  units: number;
  price: number;
}

interface PurchaseData {
  books: BookItem[];
}

interface User {
  name: string;
}

export const HTML_TEMPLATE = (
  data: PurchaseData,
  totalPrice: number,
  user: User
): string => {
  const booksHtml = data.books
    .map(
      (book) => `
        <tr>
          <td>${book.bookTitle}</td>
          <td>${book.units}</td>
          <td>${book.price}</td>
        </tr>
      `
    )
    .join('');

  const containerStyle =
    'max-width: 800px; margin: 0 auto; text-align: center; padding: 20px;';

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>Book Purchase Successful - BookSaga</title>
      <style>
        body {
          font-family: 'Arial', sans-serif;
          line-height: 1.6;
          color: #333;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 20px;
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
          color: #4a86e8;
        }
      </style>
    </head>
    <body>
      <div style="${containerStyle}">
        <div>
          <img loading="lazy" title="BookSaga" src="https://i.ibb.co/ySXpJbr/logo.jpg" width="80" height="80" alt="BookSaga Logo" />
        </div>
        <h1>Book Purchase Successful!</h1>
        <p>Dear ${user.name},</p>
        <p>Thank you for purchasing from BookSaga!</p>
        <table>
          <thead>
            <tr>
              <th>Book Title</th>
              <th>Quantity</th>
              <th>Price</th>
            </tr>
          </thead>
          <tbody>
            ${booksHtml}
          </tbody>
        </table>
        <p style="text-align: end; margin-right: 40px; font-size: 20px; font-weight: bold;">
          Total Price: $${totalPrice}
        </p>
        <p>Your book(s) will be shipped to you within 3–5 business days.</p>
        <p style="text-align: center;">Thank you for shopping at BookSaga!</p>
        <p style="text-align: center;">Best regards,</p>
        <p style="text-align: center;">The BookSaga Team</p>
      </div>
    </body>
    </html>
  `;
};
