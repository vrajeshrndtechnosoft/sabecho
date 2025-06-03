const { transporter, adminTransporter } = require("../config/transporter");
const HTML_TEMPLATE = require("./templates/inquiry_template.js");
const SELLER_TEMPLATE = require("./templates/sellerQuotationTemplate.js");
const CUSTOMER_HTML_TEMPLATE = require("./templates/customerQuotation.js");
async function sendProductInquiryEmail(user, inquiryDetails) {
  try {
    // Mail options for the admin
    const adminMailOptions = {
      from: 'Sabecho Inquiry" <info@sabecho.com>',
      to: "info@sabecho.com", // Admin email
      subject: "New Product Enquiry",
      text: `Dear Team, A new product Enquiry has been received.`,
      html: HTML_TEMPLATE(user, inquiryDetails, "admin"),
    };

    // Mail options for the user
    console.log(inquiryDetails);
    const userMailOptions = {
      from: 'Sabecho Inquiry" <info@sabecho.com>',
      to: `${inquiryDetails.email}`, // User email
      subject: "Your Product Enquiry",
      text: `Dear ${inquiryDetails.company}, Thank you for your Enquiry.`,
      html: HTML_TEMPLATE(user, inquiryDetails, "user"), // You might want to create a different template for the user
    };

    // Send email to admin
    const adminInfo = await adminTransporter.sendMail(adminMailOptions);
    console.log("Product inquiry email sent to admin successfully:");

    // Send email to user
    const userInfo = await adminTransporter.sendMail(userMailOptions);
    console.log("Product inquiry email sent to user successfully:");
  } catch (error) {
    console.error(
      "Error occurred while sending product inquiry emails:",
      error
    );
  }
}

// Function to send product quotation email to seller
async function sendProductQuotationEmail(quotation) {
  for (const company of quotation.selectedCompanies) {
    try {
      const mailOptions = {
        from: '"Sabecho Inquiry" <info@sabecho.com>',
        to: `${company.email}`, // This is the seller's email
        subject: "New Product Quotation",
        text: `Dear Seller,\n\nA new product inquiry has been received for your product "${quotation.productName}" with an average quantity of ${quotation.averageQty}.\n\nPlease contact the buyer for further details.\n\nThank you,\nSabecho`,
        html: SELLER_TEMPLATE(quotation, company.email),
      };

      // const info = await transporter.sendMail(mailOptions);
      console.log("Product quotation email sent successfully:");
    } catch (error) {
      console.error(
        "Error occurred while sending product quotation email:",
        error
      );
    }
  }
}
async function sendCustomerQuotationPrice(quotation) {
  try {
    const mailOptions = {
      from: '"Sabecho Inquiry" <info@sabecho.com>',
      to: `${quotation.buyer_email}`, // This is the buyer's email
      subject: "New Product Quotation",
      text: `Dear Buyer,\n\nA new product inquiry has been received for your product "${quotation.productName}" with an average quantity of ${quotation.averageQty}.\n\nPlease contact the seller for further details.\n\nThank you,\nSabecho`,
      html: CUSTOMER_HTML_TEMPLATE(quotation),
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Product quotation email sent successfully:", info.response);
  } catch (error) {
    console.error(
      "Error occurred while sending product quotation email:",
      error
    );
  }
}

module.exports = { sendProductInquiryEmail, sendProductQuotationEmail ,sendCustomerQuotationPrice};
