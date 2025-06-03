const CUSTOMER_HTML_TEMPLATE = (quotation) => {
  return `
<div style="font-family: Arial, sans-serif; line-height: 1.6;">
  <h2>Order Details</h2>
  <p><strong>Product Name:</strong> ${quotation?.productName}</p>
  <p><strong>Commission:</strong> ${quotation?.commission}</p>
  <p><strong>Negotiation:</strong> ${quotation?.negotiation}</p>
  <p><strong>Minimum Quantity:</strong> ${quotation?.minQty}</p>
  <p><strong>HSN Code:</strong> ${quotation?.hsnCode}</p>
  <p><strong>GST Percentage:</strong> ${quotation?.gstPercentage}%</p>
  <p><strong>Product ID:</strong> ${quotation?.pid}</p>
  <p><strong>Amount:</strong> ${quotation?.amount}</p>
  <p><strong>Description:</strong> ${quotation?.description}</p>
  <p><strong>Company:</strong> ${quotation?.company}</p>
  <p><strong>Pincode:</strong> ${quotation?.pincode}</p>
  <p><strong>Buyer Email:</strong> ${quotation?.buyer_email}</p>
  <p><strong>Mobile:</strong> ${quotation?.mobile}</p>
</div>
`;
};
module.exports = CUSTOMER_HTML_TEMPLATE;
