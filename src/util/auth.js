const jwt = require('jsonwebtoken');
require('dotenv').config();

/**
 * Verify JWT token
 */
function authenticateToken(token) {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return decoded;
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
}

/**
 * Generate JWT token
 */
function generateToken(payload) {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '24h'
  });
}

module.exports = {
  authenticateToken,
  generateToken
};