require('dotenv').config();
const{ ethers } = require("ethers");
const fs = require("fs");
const path = require("path");

//load ABI"
const contractJSON = require("./abis/ProofOfOwnership.json");

//load provider and signer
const provider = new ethers.JsonRpcProvider(process.env.SEPOLIA_RPC);
const signer = new ethers.Wallet(process.env.PRIVATE_KEY , provider);

//load contract
const contract = new ethers.Contract(process.env.CONTRACT_ADDRESS , contractJSON.abi , signer);

//register a document 
async function DocumentRegister(hash) {
    try {
        const tx = await contract.DocumentRegister(hash);
        await tx.wait();
        console.log("Document Registered" , hash);
    } catch(error) {
      console.error("Registration failed:" , error.reason || error.message);
    }
}

//verify document
async function VerifyDocument(hash) {
    try {
    const result = await contract.VerifyDocument(hash);
    console.log("Owner:" , result[0]);
    console.log("Timestamp:" , new Date(Number(result[1]) * 1000).toLocaleString());
    } catch (error) {
        console.error("verification failed" , error.reason || error.message);
    }
}

//example use
(async () => {
    const dochash = "abc123hash";

    await DocumentRegister(dochash);
    await VerifyDocument(dochash);
})();