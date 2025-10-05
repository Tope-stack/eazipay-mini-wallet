const gql = require('graphql-tag');

const typeDefs = gql`
  type User {
    id: ID!
    email: String!
    createdAt: String!
  }

  type AuthPayload {
    token: String!
    user: User!
  }

  type Wallet {
    id: ID!
    address: String!
    balance: String
    userId: ID!
    createdAt: String!
  }

  type Transaction {
    id: ID!
    hash: String!
    from: String!
    to: String!
    amount: String!
    status: String!
    timestamp: String
    blockNumber: String
  }

  type TransactionHistory {
    transactions: [Transaction!]!
    total: Int!
  }

  type SendFundsResult {
    success: Boolean!
    transactionHash: String
    message: String!
  }

  type Query {
    # Auth
    me: User

    # Wallet operations
    getWallet(id: ID!): Wallet
    getMyWallets: [Wallet!]!
    getBalance(walletId: ID!): String!
    getTransactionHistory(walletId: ID!, limit: Int): TransactionHistory!
  }

  type Mutation {
    # Authentication
    register(email: String!, password: String!): AuthPayload!
    login(email: String!, password: String!): AuthPayload!

    # Wallet operations
    createWallet: Wallet!
    sendFunds(fromWalletId: ID!, toAddress: String!, amount: String!): SendFundsResult!
  }
`;

module.exports = typeDefs;