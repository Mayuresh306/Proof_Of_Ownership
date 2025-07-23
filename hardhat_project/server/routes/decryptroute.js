const express = require('express');
const router = express.Router();
const Metadata = require('../models/Metadata');


// POST /api/store-metadata
router.post('/store-metadata', async (req, res) => {
    try {
        const { walletAddress, fileName, ipfsHash, encryptedKey } = req.body;

        if (!walletAddress || !fileName || !ipfsHash || !encryptedKey) {
          return res.status(400).json({ error: "All fields are required" });
    }

        const newMetadata = new Metadata({
            walletAddress,
            fileName,
            ipfsHash,
            encryptedKey,
        });

        await newMetadata.save(); // ✅ Save to MongoDB

        res.status(201).json({ message: "Metadata stored in MongoDB successfully" });
    } catch (error) {
        console.error("Error saving metadata to MongoDB:", error);
        res.status(500).json({ error: "Failed to store metadata" });
    }
});


// POST /api/get-metadata
router.post("/get-metadata", async (req, res) => {
  const { walletAddress } = req.body;

  try {
    // Validate input
    if (!walletAddress) {
      return res.status(400).json({ error: "Wallet address is required" });
    }

    const result = await Metadata.findOne({walletAddress: walletAddress});

    if (!result) {
      return res.status(404).json({ error: "Metadata not found" });
    }

    res.json({ metadata: result });
  } catch (err) {
    console.error("Error fetching metadata:", err);
    res.status(500).json({ error: "Server error" });
  }
});


// GET metadata for decryption (by IPFS hash or file name)
router.post('/decrypt-metadata', async (req, res) => {
    try {
        const { walletAddress, fileName } = req.body;

        // Find the record
        const record = await Metadata.findOne({ walletAddress: walletAddress, fileName: fileName });

        if (!record) {
            return res.status(404).json({ error: "No record found for this wallet and file." });
        }

        res.status(200).json({
            encryptedKey: record.encryptedKey,
            ipfsHash: record.ipfsHash,
        });
    } catch (err) {
        console.error("Decryption fetch error:", err);
        res.status(500).json({ error: "Something went wrong." });
    }
});

module.exports = router;
