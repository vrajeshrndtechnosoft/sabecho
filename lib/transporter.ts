// lib/transporter.ts
import nodemailer, { Transporter } from 'nodemailer';

// Base configuration interface
interface CustomTransportOptions {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
  tls?: {
    rejectUnauthorized?: boolean;
  };
  debug?: boolean;
  logger?: boolean;
}

const createTransporterConfig = (user: string, password: string): CustomTransportOptions => ({
  host: `${process.env.EMAIL_HOST}`,
  port: parseInt(`${process.env.EMAIL_PORT}`),
  secure: false, // Use STARTTLS on port 587
  auth: {
    user,
    pass: password,
  },
  // // TLS configuration for better compatibility
  // tls: {
  //   rejectUnauthorized: false, // Only for development/testing - remove in production
  // }
});

const transporter: Transporter = nodemailer.createTransport(
  createTransporterConfig('rohansawant2168@gmail.com', process.env.INFO_EMAIL_PASSWORD || '')
);

const adminTransporter: Transporter = nodemailer.createTransport(
  createTransporterConfig('rohansawant2168@gmail.com', process.env.ADMIN_EMAIL_PASSWORD || '')
);


export { transporter, adminTransporter };