// File: utils/encryption.ts

import CryptoJS from 'crypto-js';

export function encrypt(data: unknown): string {
  const secretKey = process.env.ENCRYPTION_SECRET_KEY;
  if (!secretKey) throw new Error("ENCRYPTION_SECRET_KEY is not defined in environment variables");
  return CryptoJS.AES.encrypt(JSON.stringify(data), secretKey).toString();
}
