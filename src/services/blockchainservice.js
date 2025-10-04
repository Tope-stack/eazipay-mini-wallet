const { ethers } = require('ethers');
require('dotenv').config();

// connect to ethereum testnet (rinkeby, using alchemy)
const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);

// function to get balance
async function getBalanceFromBlockchain(address){
    try{
        const balance = await provider.getBalance(address);
        return ethers.util.formatEther(balance); // convert balance from wei to ether
    } catch (error) {
        console.error('Error fetching balance:', error);
        throw new Error('Failed to fetch balance');
    }
}


async function getTransactionHistoryFromBlockchain(address){
    try{
        // fetch transactions using etherscan api
        const etherscanAPI = `https://api.etherscan.io/api?module=account&action=txlist&address=${address}&startblock=0&endblock=99999999&sort=desc&apikey=YOUR_ETHERSCAN_API_KEY`;

        const response = await fetch(etherscanAPI);
        const data = await response.json();

        if(data.status === '1'){
            // retrun list of transactions
            return data.result.map(tx => ({
                hash: tx.hash,
                from: tx.from,
                to: tx.to,
                amount: ethers.utils.formatEther(tx.value),
                status: tx.isError === '0' ? 'Success' : 'Failed',
            }));
        } else {
            throw new Error('Failed to fetch transactions');
        }
    } catch(error) {
        console.error('Error fetching transaction history:', error);
        throw new Error('Failed to fetch transaction history');
    }
}

module.exports = { getBalanceFromBlockchain, getTransactionHistoryFromBlockchain };