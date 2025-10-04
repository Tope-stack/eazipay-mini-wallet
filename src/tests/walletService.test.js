const { createWallet } = require('/src/services/blockchainService');
const { getBalanceFromBlockchain } = require('/src/services/blockchainservice');

test('should create a wallet with address and private key', () => {
    const wallet = createWallet();
    expect(wallet.address).toBeDefined();
    expect(wallet.privateKey).toBeDefined();
});

test('should fetch the correct balance', async () => {
    const balance = await getBalanceFromBlockchain('0xabcdef1234567890');
    expect(parseFloat(balance)).toBeGreaterThanOrEqual(0);
});