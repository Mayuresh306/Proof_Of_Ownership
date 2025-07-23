import CryptoJS from 'crypto-js';
import { ethers } from 'ethers';


const PINATA_JWT = 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiI2YjlhNDVmNS1jNTYxLTQxNmQtOTFhZi00ZDYwNDk3ZTkyMWIiLCJlbWFpbCI6Im1heXVyZXNocmVkZHkyMDA2QGdtYWlsLmNvbSIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJwaW5fcG9saWN5Ijp7InJlZ2lvbnMiOlt7ImRlc2lyZWRSZXBsaWNhdGlvbkNvdW50IjoxLCJpZCI6IkZSQTEifSx7ImRlc2lyZWRSZXBsaWNhdGlvbkNvdW50IjoxLCJpZCI6Ik5ZQzEifV0sInZlcnNpb24iOjF9LCJtZmFfZW5hYmxlZCI6ZmFsc2UsInN0YXR1cyI6IkFDVElWRSJ9LCJhdXRoZW50aWNhdGlvblR5cGUiOiJzY29wZWRLZXkiLCJzY29wZWRLZXlLZXkiOiJjZmVlYTY1YTdlOWY0YmEzOTkwNiIsInNjb3BlZEtleVNlY3JldCI6ImY3NTU5YTRjNDBkYjRiNWNhOGJiNmMyMzk4NWQ4YjU0MGNmZTkyNzdhYjhhNTU4Y2JkOTc3OTU4MGQ5ODk4YzEiLCJleHAiOjE3ODM4NjQ1ODZ9.zAk48euLi8zqGG8KrQ-M7_VbIyPQmzugGlHP-8CfK20';

export const uploadToIPFS = async (formData) => {
  // if (!file) throw new Error("No file provided for IPFS upload.");
  
  // const formData = new FormData();
  // formData.append('file', file);

  try {
    const response = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
      method: 'POST',
      headers: {
        Authorization: PINATA_JWT,
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    const ipfsHash = data.IpfsHash;
    return `https://gateway.pinata.cloud/ipfs/${ipfsHash}`;
    
  } catch (error) {
    console.error('Error uploading to IPFS via Pinata:', error);
    throw error;
  }
};


// handling encryption and uploading file to ipfs
export const handleEncryptAndUpload = async (file, signer) => {
  try {
    if (!file || !signer) throw new Error("File or signer missing");

    // 1. Read file as ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();
    const fileBytes = new Uint8Array(arrayBuffer);

    // 2. Get user signature (used to derive AES key)
    const signature = await signer.signMessage("Encrypt this file for upload");
    
    // 3. Derive AES key from signature
    const keyMaterial = await window.crypto.subtle.importKey(
      "raw",
      new TextEncoder().encode(signature),
      "PBKDF2",
      false,
      ["deriveKey"]
    );

    const salt = window.crypto.getRandomValues(new Uint8Array(16));
    const aesKey = await window.crypto.subtle.deriveKey(
      {
        name: "PBKDF2",
        salt: salt,
        iterations: 100000,
        hash: "SHA-256"
      },
      keyMaterial,
      { name: "AES-GCM", length: 256 },
      false,
      ["encrypt"]
    );

    // 4. Encrypt the file
    const iv = window.crypto.getRandomValues(new Uint8Array(12));
    const encryptedContent = await window.crypto.subtle.encrypt(
      { name: "AES-GCM", iv },
      aesKey,
      fileBytes
    );

    // 5. Create a blob containing salt + iv + encrypted file
    const blob = new Blob(
      [salt, iv, new Uint8Array(encryptedContent)],
      { type: "application/octet-stream" }
    );

    // 6. Upload to IPFS
    const ipfsUrl = await uploadToIPFS(blob);
    return ipfsUrl;

  } catch (err) {
    console.error("Encryption/Upload failed:", err);
    throw err;
  }
};