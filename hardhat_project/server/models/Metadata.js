const mongoose = require('mongoose');

const metadataSchema = new mongoose.Schema({
  walletAddress: {
    type: String,
    required: true,
    index: true,
  },
  fileName: {
    type: String,
    required: true,
  },
  ipfsHash: {
    type: String,
    required: true,
  },
  encryptedKey: {
    type: String,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  }
});

module.exports = mongoose.model('Metadata', metadataSchema);
