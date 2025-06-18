import nodemailer, { Transporter } from 'nodemailer';

const transporter: Transporter = nodemailer.createTransport({
  host: 'sabecho.com',
  port: 587,
  secure: false, // true for 465, false for 587
  auth: {
    user: 'info@sabecho.com',
    pass: process.env.INFO_EMAIL_PASSWORD || '', // Set this in your .env
  },
});

const adminTransporter: Transporter = nodemailer.createTransport({
  host: 'sabecho.com',
  port: 587,
  secure: false,
  auth: {
    user: 'admin@sabecho.com',
    pass: process.env.ADMIN_EMAIL_PASSWORD || '', // Set this in your .env
  },
});

export { transporter, adminTransporter };
