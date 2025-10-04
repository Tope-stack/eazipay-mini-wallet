const { createWallet, getBalanceFromBlockchain, getTransactionHistory, getTransactionHistoryFromBlockchain } = require('/services/blockchainService');

// create a wallet
async function createWalletController(req, res) {
    try {
        const wallet = await createWallet();
        res.json(wallet);
    } catch (error){
        console.error('Error creating wallet:', error);
        res.status(500).send('Failed to create a wallet');
    }
}

// get wallet balance
async function getBalanceController(req, res){
    const { address } = req.params;
    try{
        const balnce = await getBalanceFromBlockchain(address);
        res.json({ balance });
    } catch (error) {
        console.error('Error fetching balance:', error);
        res.status(500).send('Failed to fetch balance');
    }
}

// get tranaction history 
async function getTransactionHistoryController(req, res){
    const { address } = req.params;
    try {
        const transactions = await getTransactionHistoryFromBlockchain(address);
        res.json(transactions);
    } catch (error){
        console.error('Error fetching transaction history:', error);
        res.status(500).send('Failed to fetch transaction history');
    }  
}

module.exports = {
    createWalletController,
    getBalanceController,
    getTransactionHistoryController,
};