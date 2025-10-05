const blockchainService = require('../../services/blockchainservice');

describe('BlockchainService', () => {
  describe('createWallet', () => {
    test('should create a wallet with address and private key', () => {
      const wallet = blockchainService.createWallet();
      
      expect(wallet.address).toBeDefined();
      expect(wallet.privateKey).toBeDefined();
      expect(wallet.address).toMatch(/^0x[a-fA-F0-9]{40}$/);
      expect(wallet.privateKey).toMatch(/^0x[a-fA-F0-9]{64}$/);
    });

    test('should create unique wallets', () => {
      const wallet1 = blockchainService.createWallet();
      const wallet2 = blockchainService.createWallet();
      
      expect(wallet1.address).not.toBe(wallet2.address);
      expect(wallet1.privateKey).not.toBe(wallet2.privateKey);
    });
  });

  // Skip network-dependent tests in CI
  describe.skip('getBalanceFromBlockchain', () => {
    test('should fetch balance for valid address', async () => {
      const testAddress = '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb';
      const balance = await blockchainService.getBalanceFromBlockchain(testAddress);
      
      expect(balance).toBeDefined();
      expect(typeof balance).toBe('string');
      expect(parseFloat(balance)).toBeGreaterThanOrEqual(0);
    });
  });

  describe.skip('getTransactionHistoryFromBlockchain', () => {
    test('should return transaction history structure', async () => {
      const testAddress = '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb';
      const history = await blockchainService.getTransactionHistoryFromBlockchain(testAddress, 5);
      
      expect(history).toBeDefined();
      expect(history.transactions).toBeDefined();
      expect(Array.isArray(history.transactions)).toBe(true);
    });
  });
});