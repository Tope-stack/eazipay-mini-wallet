const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const authService = require('../../services/authService');
const User = require('../../models/userModel');

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  await mongoose.connect(mongoUri);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

afterEach(async () => {
  await User.deleteMany({});
});

describe('AuthService', () => {
  describe('register', () => {
    test('should register a new user successfully', async () => {
      const result = await authService.register('test@example.com', 'password123');
      
      expect(result.token).toBeDefined();
      expect(result.user).toBeDefined();
      expect(result.user.email).toBe('test@example.com');
      expect(result.user.id).toBeDefined();
      expect(result.user.createdAt).toBeDefined();
    });

    test('should throw error if user already exists', async () => {
      await authService.register('test@example.com', 'password123');
      
      await expect(
        authService.register('test@example.com', 'password456')
      ).rejects.toThrow('User already exists');
    });

    test('should throw error if password is too short', async () => {
      await expect(
        authService.register('test@example.com', '12345')
      ).rejects.toThrow('Password must be at least 6 characters');
    });

    test('should hash password before storing', async () => {
      await authService.register('test@example.com', 'password123');
      const user = await User.findOne({ email: 'test@example.com' }).select('+password');
      
      expect(user.password).toBeDefined();
      expect(user.password).not.toBe('password123');
      expect(user.password.length).toBeGreaterThan(20); // bcrypt hash length
    });
  });

  describe('login', () => {
    beforeEach(async () => {
      await authService.register('test@example.com', 'password123');
    });

    test('should login with correct credentials', async () => {
      const result = await authService.login('test@example.com', 'password123');
      
      expect(result.token).toBeDefined();
      expect(result.user.email).toBe('test@example.com');
    });

    test('should throw error with incorrect password', async () => {
      await expect(
        authService.login('test@example.com', 'wrongpassword')
      ).rejects.toThrow('Invalid credentials');
    });

    test('should throw error for non-existent user', async () => {
      await expect(
        authService.login('nonexistent@example.com', 'password123')
      ).rejects.toThrow('Invalid credentials');
    });

    test('should return valid JWT token', async () => {
      const result = await authService.login('test@example.com', 'password123');
      const jwt = require('jsonwebtoken');
      
      const decoded = jwt.verify(result.token, process.env.JWT_SECRET || 'test-secret');
      expect(decoded.email).toBe('test@example.com');
      expect(decoded.userId).toBeDefined();
    });
  });

  describe('getUserById', () => {
    test('should get user by ID', async () => {
      const registered = await authService.register('test@example.com', 'password123');
      const user = await authService.getUserById(registered.user.id);
      
      expect(user.id).toBe(registered.user.id);
      expect(user.email).toBe('test@example.com');
    });

    test('should throw error for non-existent user ID', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      
      await expect(
        authService.getUserById(fakeId.toString())
      ).rejects.toThrow('User not found');
    });
  });
});
