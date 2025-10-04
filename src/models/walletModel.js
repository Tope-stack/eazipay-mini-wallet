const mongoose = require('mongoose');

const walletSchema = new mongoose.Schema({
    address: {
        type: String,
        required: true,
        unique: true,
    },
    privateKey: {
        type: String,
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

const wallet = mongoose.model('Wallet', walletSchema);

module.exports = Wallet;