/* eslint-disable @typescript-eslint/no-explicit-any */
import { transporter, adminTransporter } from '@/lib/transporter';
import generateInquiryTemplate  from '@/lib/templates/inquiry_template';
import { generateSellerEmailHtml } from '@/lib/templates/sellerQuotation';
import { generateCustomerQuotationHtml } from '@/lib/templates/customerQuotation';
import { InquiryDetails } from '@/components/types';

interface Company {
  email: string;
  name?: string;
  [key: string]: any;
}

interface User {
  name: string;
  email: string;
}

interface Quotation {
  productName: string;
  averageQty: number | string;
  buyer_email: string;
  selectedCompanies: Company[];
  [key: string]: any;
}

export async function sendProductInquiryEmail(
  user: User,
  inquiryDetails: InquiryDetails
): Promise<void> {
  try {
    const adminMailOptions = {
      from: '"Sabecho Inquiry" <info@sabecho.com>',
      to: 'info@sabecho.com',
      subject: 'New Product Enquiry',
      text: `Dear Team, A new product enquiry has been received.`,
      html: generateInquiryTemplate( user, inquiryDetails, 'admin'),
    };

    const userMailOptions = {
      from: '"Sabecho Inquiry" <info@sabecho.com>',
      to: inquiryDetails.email,
      subject: 'Your Product Enquiry',
      text: `Dear ${inquiryDetails.company}, Thank you for your enquiry.`,
      html: generateInquiryTemplate(user, inquiryDetails, 'user'),
    };

    await adminTransporter.sendMail(adminMailOptions);
    console.log('Product inquiry email sent to admin successfully.');

    await adminTransporter.sendMail(userMailOptions);
    console.log('Product inquiry email sent to user successfully.');
  } catch (error) {
    console.error('❌ Error sending product inquiry emails:', error);
  }
}

export async function sendProductQuotationEmail(
  quotation: Quotation
): Promise<void> {
  for (const company of quotation.selectedCompanies) {
    try {

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const mailOptions = {
        from: '"Sabecho Inquiry" <info@sabecho.com>',
        to: company.email,
        subject: 'New Product Quotation',
        text: `Dear Seller,\n\nA new product inquiry has been received for your product "${quotation.productName}" with an average quantity of ${quotation.averageQty}.\n\nPlease check your dashboard for more details.\n\nThank you,\nSabecho`,
        html: generateSellerEmailHtml(quotation),
      };

      // Uncomment the line below to actually send the email
      // await transporter.sendMail(mailOptions);
      console.log(`Quotation email prepared for seller: ${company.email}`);
    } catch (error) {
      console.error(
        `❌ Error sending product quotation email to ${company.email}:`,
        error
      );
    }
  }
}

export async function sendCustomerQuotationPrice(
  quotation: Quotation
): Promise<void> {
  try {
    const mailOptions = {
      from: '"Sabecho Inquiry" <info@sabecho.com>',
      to: quotation.buyer_email,
      subject: 'New Product Quotation',
      text: `Dear Buyer,\n\nA new product inquiry has been received for your product "${quotation.productName}" with an average quantity of ${quotation.averageQty}.\n\nPlease check your dashboard or contact the seller.\n\nThank you,\nSabecho`,
      html: generateCustomerQuotationHtml(quotation),
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(
      `Customer quotation email sent successfully to ${quotation.buyer_email}: ${info.response}`
    );
  } catch (error) {
    console.error(
      `❌ Error sending customer quotation email to ${quotation.buyer_email}:`,
      error
    );
  }
}
