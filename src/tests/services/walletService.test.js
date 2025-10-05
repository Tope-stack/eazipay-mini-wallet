const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const walletService = require('../../services/walletService');
const User = require('../../models/userModel');
const Wallet = require('../../models/walletModel');

let mongoServer;
let testUserId;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  await mongoose.connect(mongoUri);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

beforeEach(async () => {
  const user = await User.create({
    email: 'test@example.com',
    password: 'hashedpassword'
  });
  testUserId = user._id.toString();
});

afterEach(async () => {
  await Wallet.deleteMany({});
  await User.deleteMany({});
});

describe('WalletService', () => {
  describe('createWallet', () => {
    test('should create a wallet successfully', async () => {
      const wallet = await walletService.createWallet(testUserId);
      
      expect(wallet.id).toBeDefined();
      expect(wallet.address).toMatch(/^0x[a-fA-F0-9]{40}$/);
      expect(wallet.userId).toBe(testUserId);
      expect(wallet.createdAt).toBeDefined();
    });

    test('should encrypt private key', async () => {
      const wallet = await walletService.createWallet(testUserId);
      const walletDoc = await Wallet.findById(wallet.id);
      
      expect(walletDoc.encryptedPrivateKey).toBeDefined();
      expect(walletDoc.encryptedPrivateKey).toContain(':'); // IV:encrypted format
      expect(walletDoc.encryptedPrivateKey.length).toBeGreaterThan(50);
    });

    test('should associate wallet with user', async () => {
      const wallet = await walletService.createWallet(testUserId);
      const walletDoc = await Wallet.findById(wallet.id);
      
      expect(walletDoc.userId.toString()).toBe(testUserId);
    });

    test('should create unique addresses', async () => {
      const wallet1 = await walletService.createWallet(testUserId);
      const wallet2 = await walletService.createWallet(testUserId);
      
      expect(wallet1.address).not.toBe(wallet2.address);
    });
  });

  describe('getWalletById', () => {
    test('should get wallet by ID', async () => {
      const created = await walletService.createWallet(testUserId);
      const wallet = await walletService.getWalletById(created.id, testUserId);
      
      expect(wallet.id).toBe(created.id);
      expect(wallet.address).toBe(created.address);
    });

    test('should throw error if wallet not found', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      
      await expect(
        walletService.getWalletById(fakeId.toString(), testUserId)
      ).rejects.toThrow('Wallet not found or access denied');
    });

    test('should throw error if accessing another users wallet', async () => {
      const created = await walletService.createWallet(testUserId);
      const otherUserId = new mongoose.Types.ObjectId();
      
      await expect(
        walletService.getWalletById(created.id, otherUserId.toString())
      ).rejects.toThrow('Wallet not found or access denied');
    });
  });

  describe('getUserWallets', () => {
    test('should return empty array if no wallets', async () => {
      const wallets = await walletService.getUserWallets(testUserId);
      
      expect(wallets).toEqual([]);
    });

    test('should return all user wallets', async () => {
      await walletService.createWallet(testUserId);
      await walletService.createWallet(testUserId);
      
      const wallets = await walletService.getUserWallets(testUserId);
      
      expect(wallets.length).toBe(2);
      expect(wallets[0].userId).toBe(testUserId);
      expect(wallets[1].userId).toBe(testUserId);
    });

    test('should not return other users wallets', async () => {
      await walletService.createWallet(testUserId);
      
      const otherUser = await User.create({
        email: 'other@example.com',
        password: 'password'
      });
      await walletService.createWallet(otherUser._id.toString());
      
      const wallets = await walletService.getUserWallets(testUserId);
      
      expect(wallets.length).toBe(1);
    });
  });
});