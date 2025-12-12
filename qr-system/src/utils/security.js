import CryptoJS from 'crypto-js';

// Hardcoded secret key as per requirements
const SECRET_KEY = "SECRET_KEY_123";

/**
 * Generates a SHA-256 hash for the given token string combined with the secret key.
 * @param {string} token 
 * @returns {string} The generated hash.
 */
export const generateHash = (token) => {
  return CryptoJS.SHA256(SECRET_KEY + token).toString(CryptoJS.enc.Hex);
};

/**
 * Validates the authenticity of the QR data.
 * @param {object} qrData - The parsed QR JSON object.
 * @returns {boolean} True if the hash matches, false otherwise.
 */
export const validateQrHash = (qrData) => {
  if (!qrData || !qrData.token || !qrData.hash) return false;
  const computedHash = generateHash(qrData.token);
  return computedHash === qrData.hash;
};
