const mongoose = require('mongoose');

const walletSchema = new mongoose.Schema({
  address: {
    type: String,
    required: true,
    unique: true,
    validate: {
      validator: function(v) {
        return /^0x[a-fA-F0-9]{40}$/.test(v);
      },
      message: props => `${props.value} is not a valid Ethereum address!`
    }
  },
  encryptedPrivateKey: {
    type: String,
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true  // Add index here instead of below
  }
}, {
  timestamps: true
});

// Remove these duplicate index definitions
// walletSchema.index({ userId: 1 });
// walletSchema.index({ address: 1 });

module.exports = mongoose.model('Wallet', walletSchema);