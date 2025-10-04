async function createWalletController(req, res) {
    try {
        const wallet = await createWallet();
        res.json(wallet);
    } catch (error){
        console.error('Error creating wallet:', error);
        res.status(500).send('Failed to create a wallet');
    }
}