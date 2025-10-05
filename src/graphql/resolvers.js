const walletService = require('../services/walletService');
const authService = require('../services/authService');
const blockchainService = require('../services/blockchainService');

const resolvers = {
  Query: {
    me: async (_, __, { user }) => {
      if (!user) throw new Error('Not authenticated');
      return authService.getUserById(user.userId);
    },

    getWallet: async (_, { id }, { user }) => {
      if (!user) throw new Error('Not authenticated');
      return walletService.getWalletById(id, user.userId);
    },

    getMyWallets: async (_, __, { user }) => {
      if (!user) throw new Error('Not authenticated');
      return walletService.getUserWallets(user.userId);
    },

    getBalance: async (_, { walletId }, { user }) => {
      if (!user) throw new Error('Not authenticated');
      const wallet = await walletService.getWalletById(walletId, user.userId);
      return blockchainService.getBalanceFromBlockchain(wallet.address);
    },

    getTransactionHistory: async (_, { walletId, limit = 10 }, { user }) => {
      if (!user) throw new Error('Not authenticated');
      const wallet = await walletService.getWalletById(walletId, user.userId);
      return blockchainService.getTransactionHistoryFromBlockchain(wallet.address, limit);
    }
  },

  Mutation: {
    register: async (_, { email, password }) => {
      return authService.register(email, password);
    },

    login: async (_, { email, password }) => {
      return authService.login(email, password);
    },

    createWallet: async (_, __, { user }) => {
      if (!user) throw new Error('Not authenticated');
      return walletService.createWallet(user.userId);
    },

    sendFunds: async (_, { fromWalletId, toAddress, amount }, { user }) => {
      if (!user) throw new Error('Not authenticated');
      return walletService.sendFunds(fromWalletId, toAddress, amount, user.userId);
    }
  }
};

module.exports = resolvers;