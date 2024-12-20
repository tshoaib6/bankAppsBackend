const crypto = require('crypto');
const jwt = require('jsonwebtoken');

// Generate a secret key using crypto
const secretKey = crypto.randomBytes(64).toString('hex');

// Example payload
const payload = {
  userId: '123456',
  email: 'user@example.com',
};

// Generate JWT token with the payload and secret key
const token = jwt.sign(payload, secretKey, { expiresIn: '1h' });

console.log('JWT Token:', token);
console.log('Secret Key:', secretKey);
