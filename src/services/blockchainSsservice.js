const { ethers } = require('ethers');
require('dotenv').config();

// Connect to Ethereum testnet 
const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);

/**
 * Create a new Ethereum wallet
 * @returns {Object} wallet - Contains address and private key
 */
function createWallet() {
  try {
    const wallet = ethers.Wallet.createRandom();
    return {
      address: wallet.address,
      privateKey: wallet.privateKey
    };
  } catch (error) {
    console.error('Error creating wallet:', error);
    throw new Error('Failed to create wallet');
  }
}

/**
 * Get balance from blockchain
 * @param {string} address - Ethereum address
 * @returns {Promise<string>} balance in ETH
 */
async function getBalanceFromBlockchain(address) {
  try {
    const balance = await provider.getBalance(address);
    return ethers.formatEther(balance); // Convert from wei to ether
  } catch (error) {
    console.error('Error fetching balance:', error);
    throw new Error('Failed to fetch balance');
  }
}

/**
 * Get transaction history from blockchain
 * @param {string} address - Ethereum address
 * @param {number} limit - Max number of transactions
 * @returns {Promise<Object>} transaction history
 */
async function getTransactionHistoryFromBlockchain(address, limit = 10) {
  try {
    const network = process.env.NETWORK || 'sepolia';
    const etherscanAPI = `https://api-${network}.etherscan.io/api?module=account&action=txlist&address=${address}&startblock=0&endblock=99999999&sort=desc&apikey=${process.env.ETHERSCAN_API_KEY}`;

    const response = await fetch(etherscanAPI);
    const data = await response.json();

    if (data.status === '1' && data.result) {
      const transactions = data.result.slice(0, limit).map(tx => ({
        hash: tx.hash,
        from: tx.from,
        to: tx.to,
        amount: ethers.formatEther(tx.value),
        status: tx.isError === '0' ? 'success' : 'failed',
        timestamp: new Date(parseInt(tx.timeStamp) * 1000).toISOString(),
        blockNumber: tx.blockNumber
      }));

      return {
        transactions,
        total: transactions.length
      };
    } else {
      return {
        transactions: [],
        total: 0
      };
    }
  } catch (error) {
    console.error('Error fetching transaction history:', error);
    throw new Error('Failed to fetch transaction history');
  }
}

/**
 * Send funds to another address
 * @param {string} privateKey - Sender's private key
 * @param {string} toAddress - Recipient address
 * @param {string} amount - Amount in ETH
 * @returns {Promise<Object>} transaction result
 */
async function sendFundsOnBlockchain(privateKey, toAddress, amount) {
  try {
    const wallet = new ethers.Wallet(privateKey, provider);
    
    // Validate address
    if (!ethers.isAddress(toAddress)) {
      throw new Error('Invalid recipient address');
    }

    // Parse amount
    const amountInWei = ethers.parseEther(amount);

    // Create transaction
    const tx = await wallet.sendTransaction({
      to: toAddress,
      value: amountInWei
    });

    // Wait for confirmation
    const receipt = await tx.wait();

    return {
      success: true,
      transactionHash: receipt.hash,
      blockNumber: receipt.blockNumber
    };
  } catch (error) {
    console.error('Error sending funds:', error);
    throw new Error(`Failed to send funds: ${error.message}`);
  }
}

module.exports = {
  createWallet,
  getBalanceFromBlockchain,
  getTransactionHistoryFromBlockchain,
  sendFundsOnBlockchain
};

// const { ethers } = require('ethers');
// require('dotenv').config();

// // connect to ethereum testnet (rinkeby, using alchemy)
// const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);

// /**
//  * Create a new Ethereum wallet
//  * @returns {Object} wallet - Contains address and private key
//  */

// // function to create wallet
// function createWallet() {
//     try {
//         const wallet = etheres.Wallet.createRandom();
//         return {
//             address: wallet.address,
//             privateKey: wallet.privateKey
//         };
//     } catch (error) {
//         console.error('Error creating wallet:', error);
//         throw new Error('Failed to create wallet');
// }



// /**
//  * Get balance from blockchain
//  * @param {string} address - Ethereum address
//  * @returns {Promise<string>} balance in ETH
//  */
// // function to get balance
// async function getBalanceFromBlockchain(address){
//     try{
//         const balance = await provider.getBalance(address);
//         return ethers.util.formatEther(balance); // convert balance from wei to ether
//     } catch (error) {
//         console.error('Error fetching balance:', error);
//         throw new Error('Failed to fetch balance');
//     }
// }


// /**
//  * Get transaction history from blockchain
//  * @param {string} address - Ethereum address
//  * @param {number} limit - Max number of transactions
//  * @returns {Promise<Object>} transaction history
//  */

// async function getTransactionHistoryFromBlockchain(address, limit = 10) {
//     try {
//         const network = process.env.NETWORK || 'sepolia';
//         // fetch transactions using etherscan api
//         //const etherscanAPI = `https://api.etherscan.io/api?module=account&action=txlist&address=${address}&startblock=0&endblock=99999999&sort=desc&apikey=YOUR_ETHERSCAN_API_KEY`;
//         const etherscanAPI = `https://api-${network}.etherscan.io/api?module=account&action=txlist&address=${address}&startblock=0&endblock=99999999&sort=desc&apikey=${process.env.ETHERSCAN_API_KEY}`;

//         const response = await fetch(etherscanAPI);
//         const data = await response.json();

//         if(data.status === '1' && data.result) {
//             // retrun list of transactions
//             const transactions = data.result.slice(0, limit).map(tx => ({
//                 hash: tx.hash,
//                 from: tx.from,
//                 to: tx.to,
//                 amount: ethers.formatEther(tx.value),
//                 status: tx.isError === '0' ? 'success' : 'failed',
//                 timestamp: new Date(parseInt(tx.timeStamp) * 1000).toISOString(),
//                 blockNumber: tx.blockNumber
//             }));

//             return {
//                 transactions,
//                 total: transactions.length
//               };
//         } else {
//             return {
//                 transactions: [],
//                 total: 0
//               };
//         }
//     } catch(error) {
//         console.error('Error fetching transaction history:', error);
//         throw new Error('Failed to fetch transaction history');
//     }
// }

// /**
//  * Send funds to another address
//  * @param {string} privateKey - Sender's private key
//  * @param {string} toAddress - Recipient address
//  * @param {float} amount - Amount in ETH
//  * @returns {Promise<Object>} transaction result
//  */
// async function sendFundsOnBlockchain(privateKey, toAddress, amount) {
//     try {
//         const wallet = new ethers.Wallet(privateKey, provider);
        
//         // Validate address
//         if (!ethers.isAddress(toAddress)) {
//           throw new Error('Invalid recipient address');
//         }
    
//         // Parse amount
//         const amountInWei = ethers.parseEther(amount);
    
//         // Create transaction
//         const tx = await wallet.sendTransaction({
//           to: toAddress,
//           value: amountInWei
//         });
    
//         // Wait for confirmation
//         const receipt = await tx.wait();
    
//         return {
//           success: true,
//           transactionHash: receipt.hash,
//           blockNumber: receipt.blockNumber
//         };
//     } catch (error) {
//         console.error('Error sending funds:', error);
//         throw new Error(`Failed to send funds: ${error.message}`);
//     }
// }

// module.exports = {
//     createWallet,
//     getBalanceFromBlockchain,
//     getTransactionHistoryFromBlockchain,
//     sendFundsOnBlockchain
//   };