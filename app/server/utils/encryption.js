// backend/utils/encryption.js

const CryptoJS = require('crypto-js');
const dotenv = require('dotenv');

dotenv.config();



function encrypt(data) {
  return CryptoJS.AES.encrypt(JSON.stringify(data), process.env.ENCRYPTION_SECRET_KEY).toString();
}

module.exports = {
  encrypt
};