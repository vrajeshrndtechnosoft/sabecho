const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: "sabecho.com",
  port: 587,
  secure: false, // Use `true` for port 465, `false` for all other ports
  auth: {
    user: "info@sabecho.com",
    pass: "~mutD@Zzid~^",
  },
});

const adminTransporter = nodemailer.createTransport({
  host: "sabecho.com",
  port: 587,
  secure: false, // Use `true` for port 465, `false` for all other ports
  auth: {
    user: "admin@sabecho.com",
    pass: "T-HXYeq02kA^",
  },
});
// Export transporter and sendEmail function
module.exports = { transporter, adminTransporter };
