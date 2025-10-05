const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const walletService = require('../../services/walletService');
const blockchainService = require('../../services/blockchainSsservice');
const User = require('../../models/userModel');
const Wallet = require('../../models/walletModel');
const Transaction = require('../../models/transactionModel');

// Mock blockchain service
jest.mock('../../services/blockchainService');

let mongoServer;
let testUserId;
let testWallet;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

beforeEach(async () => {
  // Mock createWallet for wallet creation
  blockchainService.createWallet.mockReturnValue({
    address: '0x1234567890123456789012345678901234567890',
    privateKey: '0xabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcd'
  });

  const user = await User.create({
    email: 'test@example.com',
    password: 'hashedpassword'
  });
  testUserId = user._id.toString();
  
  testWallet = await walletService.createWallet(testUserId);
});

afterEach(async () => {
  await Transaction.deleteMany({});
  await Wallet.deleteMany({});
  await User.deleteMany({});
  jest.clearAllMocks();
});

describe('WalletService - sendFunds', () => {
  test('should send funds successfully', async () => {
    blockchainService.sendFundsOnBlockchain.mockResolvedValue({
      success: true,
      transactionHash: '0xabc123',
      blockNumber: 12345
    });

    const result = await walletService.sendFunds(
      testWallet.id,
      '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
      '0.001',
      testUserId
    );

    expect(result.success).toBe(true);
    expect(result.transactionHash).toBe('0xabc123');
    expect(result.message).toBe('Funds sent successfully');
  });

  test('should save transaction to database', async () => {
    blockchainService.sendFundsOnBlockchain.mockResolvedValue({
      success: true,
      transactionHash: '0xabc123',
      blockNumber: 12345
    });

    await walletService.sendFunds(
      testWallet.id,
      '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
      '0.001',
      testUserId
    );

    const transaction = await Transaction.findOne({ hash: '0xabc123' });
    expect(transaction).toBeDefined();
    expect(transaction.from).toBe(testWallet.address);
    expect(transaction.to).toBe('0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb');
    expect(transaction.amount).toBe('0.001');
    expect(transaction.status).toBe('success');
  });

  test('should handle send failure', async () => {
    blockchainService.sendFundsOnBlockchain.mockRejectedValue(
      new Error('Insufficient funds')
    );

    const result = await walletService.sendFunds(
      testWallet.id,
      '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
      '999',
      testUserId
    );

    expect(result.success).toBe(false);
    expect(result.transactionHash).toBe(null);
    expect(result.message).toContain('Insufficient funds');
  });

  test('should reject for non-existent wallet', async () => {
    const fakeWalletId = new mongoose.Types.ObjectId();

    const result = await walletService.sendFunds(
      fakeWalletId.toString(),
      '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
      '0.001',
      testUserId
    );

    expect(result.success).toBe(false);
    expect(result.message).toContain('Wallet not found');
  });
});