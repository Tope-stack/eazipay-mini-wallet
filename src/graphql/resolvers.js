const walletService = require('/services/WalletService');
const authService = require('/services/authService');
const blockchainService = require('/services/blockchainService');

const resolvers = {
    Query: {
        me: async (_, _, { user }) => {
            if(!user) throw new Error('Not authenticated');
            return walletService.getUserWallets(user.userId);
        },

        getWallet: async (_, _, { user }) => {
            if(!user) throw new Error('Not authenticated');
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

        login: async(_, { email, password }) => {
            return authService.login(email, password);
        },

        createWalllet: async (_, _, { user }) => {
            if(!user) throw new Error('Not authenticated');
            return walletService.createWalllet(user.userId);
        },

        sendFunds: async (_, { fromWalletId, toAddress, amount }, { user }) => {
            if(!user) throw new Error('Not authenticated');
            return walletService.sendFunds(fromWalletId, toAddress, amount, user.userId);
        }
    }
};

module.exports = resolvers;