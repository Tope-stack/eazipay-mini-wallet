const Wallet = require('../models/walletModel');
const Transaction = require('../models/transactionModel');
const blockchainService = require('./blockchainSsservice');
const { encryptPrivateKey, decryptPrivateKey } = require('../util/encryption');

/**
 * Create a new wallet for user
 */
async function createWallet(userId) {
    try {
      const { address, privateKey } = blockchainService.createWallet();
      const encryptedPrivateKey = encryptPrivateKey(privateKey);
  
      const wallet = await Wallet.create({
        address,
        encryptedPrivateKey,
        userId
      });
  
      return {
        id: wallet._id.toString(),
        address: wallet.address,
        userId: wallet.userId.toString(),
        createdAt: wallet.createdAt.toISOString()
      };
    } catch (error) {
      console.error('Error creating wallet:', error);
      throw new Error(`Failed to create wallet: ${error.message}`);
    }
  }
/**
 * Get wallet by ID
 */
async function getWalletById(walletId, userId) {
  const wallet = await Wallet.findOne({
    _id: walletId,
    userId: userId
  });

  if (!wallet) {
    throw new Error('Wallet not found or access denied');
  }

  return {
    id: wallet._id.toString(),
    address: wallet.address,
    userId: wallet.userId.toString(),
    createdAt: wallet.createdAt.toISOString()
  };
}

/**
 * Get all wallets for user
 */
async function getUserWallets(userId) {
  const wallets = await Wallet.find({ userId });

  return wallets.map(wallet => ({
    id: wallet._id.toString(),
    address: wallet.address,
    userId: wallet.userId.toString(),
    createdAt: wallet.createdAt.toISOString()
  }));
}

/**
 * Send funds from wallet
 */
async function sendFunds(fromWalletId, toAddress, amount, userId) {
  try {
    const wallet = await Wallet.findOne({
      _id: fromWalletId,
      userId: userId
    });

    if (!wallet) {
      throw new Error('Wallet not found or access denied');
    }

    // Decrypt private key
    const privateKey = decryptPrivateKey(wallet.encryptedPrivateKey);

    // Send transaction on blockchain
    const result = await blockchainService.sendFundsOnBlockchain(
      privateKey,
      toAddress,
      amount
    );

    // Store transaction
    await Transaction.create({
      hash: result.transactionHash,
      from: wallet.address,
      to: toAddress,
      amount,
      status: 'success',
      walletId: wallet._id,
      blockNumber: result.blockNumber.toString()
    });

    return {
      success: true,
      transactionHash: result.transactionHash,
      message: 'Funds sent successfully'
    };
  } catch (error) {
    console.error('Error sending funds:', error);
    return {
      success: false,
      transactionHash: null,
      message: error.message
    };
  }
}

module.exports = {
  createWallet,
  getWalletById,
  getUserWallets,
  sendFunds
};