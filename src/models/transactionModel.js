const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  hash: {
    type: String,
    required: true,
    unique: true
  },
  from: {
    type: String,
    required: true
  },
  to: {
    type: String,
    required: true
  },
  amount: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'success', 'failed'],
    default: 'pending'
  },
  walletId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Wallet',
    required: true,
    index: true  // Add index here instead of below
  },
  blockNumber: String,
  gasUsed: String
}, {
  timestamps: true
});

// Remove these duplicate index definitions
// transactionSchema.index({ walletId: 1 });
// transactionSchema.index({ hash: 1 });

module.exports = mongoose.model('Transaction', transactionSchema);