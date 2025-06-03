const HTML_TEMPLATE = (data, totalPrice, user) => {
    // Generating HTML content dynamically based on the provided data
    const booksHtml = data.books.map(book => `
        <tr>
            <td>${book.bookTitle}</td>
            <td>${book.units}</td>
            <td>${book.price}</td>
        </tr>
    `).join('');
    const containerStyle = `max-width: 800px; margin: 0 auto; text-align: center; padding: 20px;`;

    return `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Book Purchase Successful - BookSaga</title>
           
        </head>
        <body>
            <div className="container" style="${containerStyle}">
            <div>
            <img loading="lazy" title="sabecho" src="https://i.ibb.co/ySXpJbr/logo.jpg" width="80" height="80" alt="BookSaga Logo">
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
                <p style="text-align: end;margin-right: 40px; font-size: 20px; font-weight: bold;">Total Price: $${totalPrice}</p>
                <p>Your book(s) will be shipped to you within 3-5 business days.</p>
                <p className="text-center">Thank you for shopping at BookSaga!</p>
                <p className="text-center">Best regards,</p>
                <p className="text-center">The BookSaga Team</p>
            </div>
        </body>
        </html>
    `;
}

module.exports = HTML_TEMPLATE;
