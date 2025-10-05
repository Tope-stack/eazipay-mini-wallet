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