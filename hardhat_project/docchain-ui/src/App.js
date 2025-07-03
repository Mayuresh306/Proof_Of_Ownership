import React , { useState } from 'react';
import {ethers} from 'ethers';
import './App.css';
import crypto, { constants } from 'crypto-browserify';  //for sha256 hashing in browser
import { Buffer } from 'buffer';
import process from 'process';
import contractABI from './abis/ProofOfOwnership.json';

window.Buffer = Buffer;
window.process = process;

const contractAddress = "0xaA41a5940B8AA529a7648e4AB77EB9bAA297a023";

function App() {
  const [walletAddress , setWalletaddress] = useState("");
  const [contract , setContract] = useState("");
  const [filehash , setfilehash] = useState('');
  const [filename , setfilename] = useState('');

    // Connect Wallet
  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const address = await signer.getAddress();
        setWalletaddress(address);

        const contractInstance = new ethers.Contract(
          contractAddress,
          contractABI.abi,
          signer
        );
        setContract(contractInstance);

        alert("Wallet connected successfully!");
      } catch (err) {
        alert("Wallet connection failed: " + err.message);
      }
    } else {
      alert("MetaMask is not installed");
    }
  };

    // file to hash
  const handlefilechange = async (e) => {
    const file  = e.target.files[0];
    if(!file) return;
    setfilename(file.name);

    const reader = new FileReader();
    reader.onload = async (event) => {
      const buffer = event.target.result;
      const hashBuffer = await window.crypto.subtle.digest('SHA-256' , buffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashHex = hashArray.map(b => b.toString(16).padStart
    (2 , '0')).join('');
      setfilehash(hashHex);
    };
    reader.readAsArrayBuffer(file);
  };

  // smart contract functions interaction
  // Register document on blockchain
  const registerDocument = async () => {
    if (!contract || !filehash) return alert("Connect wallet and select a file first!");
    try {
      const tx = await contract.DocumentRegister(filehash);
      await tx.wait();
      alert("✅ Document Registered!");
    } catch (err) {
      alert("❌ Error: " + (err.reason || err.message));
    }
  };

  // Verify document ownership
  const verifydocument = async () => {
    if (!contract || !filehash) return alert("Connect wallet and select a file first!");
    try {
      const result = await contract.VerifyDocument(filehash);
      const owner = result[0];
      const timestamp = new Date(Number(result[1]) * 1000).toLocaleString();
      alert(`📄 Owner: ${owner}\n⏱️ Timestamp: ${timestamp}`);
    } catch (err) {
      alert("❌ Verification failed: " + (err.reason || err.message));
    }
  };


  return (
    <div className='App'>
      <h1>Proof Of Ownership</h1>
      
      <button onClick={connectWallet} style={{ marginBottom: "1rem" }}>
        {walletAddress ? `Connected: ${walletAddress}` : "Connect Wallet"}
      </button>

      <button onClick={registerDocument}>Register Document</button>
      <button onClick={verifydocument}>Verify Document</button>


      <input type='file' onChange={handlefilechange} />
      {filehash && (
        <>
        <p><strong>File:</strong> {filename}</p>
        <p><strong>Hash:</strong> {filehash}</p>
        </>
      )}
      <>
        <p><strong>Wallet: </strong>  {!walletAddress ? "Not Connected" : walletAddress} </p>
        </>
    </div>
  );
}

export default App;