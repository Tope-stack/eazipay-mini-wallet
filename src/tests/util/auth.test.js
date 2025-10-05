const { authenticateToken, generateToken } = require('../../util/auth');
const jwt = require('jsonwebtoken');

describe('Auth Utility', () => {
  const testSecret = process.env.JWT_SECRET || 'test-secret';
  
  describe('generateToken', () => {
    test('should generate a valid JWT token', () => {
      const payload = { userId: '123', email: 'test@example.com' };
      const token = generateToken(payload);
      
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.split('.').length).toBe(3); // JWT has 3 parts
    });

    test('should include payload in token', () => {
      const payload = { userId: '456', email: 'user@example.com' };
      const token = generateToken(payload);
      
      const decoded = jwt.verify(token, testSecret);
      expect(decoded.userId).toBe('456');
      expect(decoded.email).toBe('user@example.com');
    });
  });

  describe('authenticateToken', () => {
    test('should verify valid token', () => {
      const payload = { userId: '789', email: 'valid@example.com' };
      const token = jwt.sign(payload, testSecret, { expiresIn: '1h' });
      
      const decoded = authenticateToken(token);
      
      expect(decoded.userId).toBe('789');
      expect(decoded.email).toBe('valid@example.com');
    });

    test('should throw error for invalid token', () => {
      const invalidToken = 'invalid.token.here';
      
      expect(() => {
        authenticateToken(invalidToken);
      }).toThrow('Invalid or expired token');
    });

    test('should throw error for expired token', () => {
      const payload = { userId: '999' };
      const expiredToken = jwt.sign(payload, testSecret, { expiresIn: '-1s' });
      
      expect(() => {
        authenticateToken(expiredToken);
      }).toThrow('Invalid or expired token');
    });

    test('should throw error for tampered token', () => {
      const payload = { userId: '111' };
      const token = jwt.sign(payload, testSecret);
      const tamperedToken = token.slice(0, -5) + 'xxxxx';
      
      expect(() => {
        authenticateToken(tamperedToken);
      }).toThrow('Invalid or expired token');
    });
  });
});


// ========================================
// FILE 6: src/tests/models/userModel.test.js
// ========================================
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const User = require('../../models/userModel');

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

afterEach(async () => {
  await User.deleteMany({});
});

describe('User Model', () => {
  test('should create a user with valid data', async () => {
    const user = await User.create({
      email: 'test@example.com',
      password: 'password123'
    });
    
    expect(user._id).toBeDefined();
    expect(user.email).toBe('test@example.com');
    expect(user.password).toBe('password123');
    expect(user.createdAt).toBeDefined();
  });

  test('should enforce email uniqueness', async () => {
    await User.create({ email: 'test@example.com', password: 'pass123' });
    
    await expect(
      User.create({ email: 'test@example.com', password: 'pass456' })
    ).rejects.toThrow();
  });

  test('should validate email format', async () => {
    await expect(
      User.create({ email: 'invalid-email', password: 'pass123' })
    ).rejects.toThrow();
  });

  test('should require email field', async () => {
    await expect(
      User.create({ password: 'pass123' })
    ).rejects.toThrow();
  });

  test('should require password field', async () => {
    await expect(
      User.create({ email: 'test@example.com' })
    ).rejects.toThrow();
  });

  test('should convert email to lowercase', async () => {
    const user = await User.create({
      email: 'TEST@EXAMPLE.COM',
      password: 'pass123'
    });
    
    expect(user.email).toBe('test@example.com');
  });

  test('should not return password in JSON', async () => {
    const user = await User.create({
      email: 'test@example.com',
      password: 'password123'
    });
    
    const json = user.toJSON();
    expect(json.password).toBeUndefined();
    expect(json.__v).toBeUndefined();
  });
});
