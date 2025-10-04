# Mini Wallet Application

## Overview
This is a mini wallet application built with Node.js, Express, Apollo Server (GraphQL), and Ethereum API integration. The wallet supports basic operations such as creating a wallet, checking balances, sending funds, and viewing transaction history.

## Tech Stack
- Backend: Node.js, Express, Apollo Server (GraphQL)
- Blockchain API: Alchemy/Etherscan for Ethereum testnets
- Database: MongoDB (or your choice)
- Authentication: JWT
- Testing: Jest

## Setup Instructions
1. Clone this repository.
2. Create a `.env` file and add your **RPC_URL** (Alchemy/Infura), **JWT_SECRET**, and other necessary environment variables.
3. Run `npm install` to install dependencies.
4. Run `npm start` to start the application.

## API Documentation
- **createWallet**: Mutation to generate a new wallet.
- **getBalance**: Query to get the wallet's balance.
- **sendFunds**: Mutation to send funds from one wallet to another.
- **getTransactionHistory**: Query to get the transaction history of a wallet.

## Testing
Run `npm test` to execute unit tests with Jest.

## Deployment
This application is deployed on Heroku. Access it at: [Heroku Link]
