const { gql } = require('apollo-server-express');
const { createWalletController, getBalanceController, getTransactionHistoryController } = require('/controllers/walletController');

const typeDefs = gql`
    type Wallet {
    address: String!
    privateKey: String!
    }

    type Transaction {
    hash: String!
    from: String!
    to: String!
    amount: Float!
    status: String!
    }

    type Query {
    getBalance(address: String!): Float!
    getTransactionHistory(address: String!): [Transaction!]!
    }

    type Mutation {
    createWallet: Wallet!
    sendFunds(from: String!, to: String!, amount: Float!, privateKey: String!): String!
    }
`;

const resolvers = {
    Query: {
        getBalance: async(_, { address }) => {
            //const balance = await getBalanceFromBlockChain(address);
            return await getBalanceController({ params: { address } }, { json: (data) => data });
        },
        getTransactionHistory: async (_, { address }) => {
            //const transactions = await getTransactionHistoryFromBlockchain(address);
            return await getTransactionHistoryController({ params: { address } }, { json: (data) => data });
        }
    },
    Mutation: {
        createWallet: async () => {
            const walletData = await createWalletController({}, { json: (data) => data });
            return walletData;
        },
        sendFunds: async (_, { from, to, amount, privateKey }) => {
            const transactionHash = await sendFundsOnBlockChain(from, to, amount, privateKey);
            return transactionHash;
        }
    }
};

module.exports = { typeDefs, resolvers };