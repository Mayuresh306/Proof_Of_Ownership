import React , { useState , useEffect } from 'react';
import {ethers} from 'ethers';
import './App.css';
import crypto, { constants } from 'crypto-browserify';  //for sha256 hashing in browser
import { Buffer } from 'buffer';
import process from 'process';
import contractABI from './abis/ProofOfOwnership.json';
import Login from './Login';

window.Buffer = Buffer;
window.process = process;

const contractAddress = "0x266eefF589A3Eb2ccac669171BCc62CB8F0A756b";

function App() {
  const [walletAddress , setWalletaddress] = useState("");
  const [contract , setContract] = useState("");
  const [filehash , setfilehash] = useState('');
  const [filename , setfilename] = useState('');
  const [documents , setDocuments ] = useState([]);
  const [uploadedfiles , setUploadedFiles] = useState({});
  const [darkMode , setDarkMode] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (stored) setUser(JSON.parse(stored));
  }, [user]);

  const handleLogout = () => {
    localStorage.removeItem("user");
    setUser(null);
  };

  useEffect(() => {
    document.body.className = darkMode ? 'bg-dark text-light' : 'bg-light text-dark';
  }, [darkMode]);

  const fetchAllDocuments = async () => {
  try {
    const hashes = await contract.getDocument_hashes(); // Call the getter
    const documentData = await Promise.all(
      hashes.map(async (hash) => {
        const doc = await contract.VerifyDocument(hash);
        return {
          hash,
          owner: doc[0],
          timestamp: new Date(Number(doc[1]) * 1000).toLocaleString(),
        };
      })
    );
    setDocuments(documentData);
  } catch (error) {
    console.error("Failed to fetch documents:", error);
    setDocuments([]);
  }
};


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
        fetchAllDocuments(contractInstance);
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
    const selectedfile  = e.target.files[0];
    if(!selectedfile) return;
    setfilename(selectedfile.name);

    const reader = new FileReader();
    reader.onload = async (event) => {
      const buffer = event.target.result;
      const hashBuffer = await window.crypto.subtle.digest('SHA-256' , buffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashHex = hashArray.map(b => b.toString(16).padStart
    (2 , '0')).join('');
      setfilehash(hashHex);
      const blobUrl = URL.createObjectURL(selectedfile);
      setUploadedFiles((prev) => ({ ...prev, [hashHex]: { file: selectedfile, url: blobUrl } }));
    };
    reader.readAsArrayBuffer(selectedfile);
    };

  // smart contract functions interaction
  // Register document on blockchain
  const registerDocument = async () => {
    if (!filehash) return alert("select a file first!");
    if (!contract) return alert("Connect wallet First!");
    try {
      const tx = await contract.DocumentRegister(filehash);
      await tx.wait();
      alert("✅ Document Registered!");
      fetchAllDocuments(contract);
    } catch (err) {
      alert("❌ Error: " + (err.reason || err.message));
    }
  };

  // Verify document ownership
  const verifydocument = async () => {
    if (!filehash) return alert("select a file first!");
    if (!contract) return alert("Connect wallet First!");
    try {
      const result = await contract.VerifyDocument(filehash);
      const owner = result[0];
      const timestamp = new Date(Number(result[1]) * 1000).toLocaleString();
      alert(`📄 Owner: ${owner}\n⏱️ Timestamp: ${timestamp}`);
    } catch (err) {
      alert("❌ Verification failed: " + (err.reason || err.message));
    }
  };

    if (!user) return <Login onLogin={setUser} />;

  // Bootstrap CSS //
  return (
  <div className="container py-5">
     <nav className={`navbar navbar-expand-lg ${darkMode ? 'navbar-dark bg-dark' : 'navbar-light bg-light'}`}>
  <div className="container">
    <a className="navbar-brand fw-bold" href="/">DocChain</a>
    <div className="d-flex">
      <button
        className="btn btn-sm btn-outline-secondary rounded-pill"
        onClick={() => setDarkMode(!darkMode)}>
        {darkMode ? '🔆' : '🌙'}
      </button>
       <div className="ms-auto d-flex align-items-center">
    {user && (
      <span className="text-white me-3">
        👋Hello, <strong>{user.Username}</strong>
      </span>
    )}</div> 
      {user && (
  <button onClick={handleLogout} className="btn btn-sm btn-outline-danger rounded-pill">

    Logout
  </button>
)}
    </div>
  </div>
</nav>

  <div className="text-center mb-5">
      <h1 className="mb-4 fw-bold">Proof Of Ownership Dapp</h1>
      <p className="fw-bold">
        A simple blockchain-based system to register and verify documents
      </p>
    </div>

  {/* Connect Wallet */}
    <div className={"fw-bold text-center mb-4"}>
      <button onClick={connectWallet} className={"btn px-4 py-2 rounded-pill fw-bold shadow-sm ${darkMode ? 'btn-outline-dark'}"}
      style={{
    color: darkMode ? '#fff' : '#000',
    border: '1px solid',
    borderColor: darkMode ? '#fff' : '#000',
    backgroundColor: darkMode ? 'transparent' : 'transparent',
  }}>
        {walletAddress ? `✅ Connected: ${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}` : '🔌 Connect Wallet'}
      </button>
    </div>  

    {/* Upload Section */}
    <div className={"card p-4 shadow mb-4 ${darkMode ? 'bg-secondary text-dark' : 'bg-light'}"}
      style={{
        color: darkMode ? '#fff' : '#000',
        border: '1px solid',
        borderColor: darkMode ? '#fff' : '#000',
        backgroundColor: darkMode ? 'transparent' : 'transparent'}}>
      <h5 className="mb-3 ">Register Document</h5>

      <div className="mb-3">
        <input type="file" className="form-control"
        style={{
        color: darkMode ? '#fff' : '#000',
        border: '1px solid',
        borderColor: darkMode ? '#fff' : '#000',
        backgroundColor: darkMode ? 'transparent' : 'transparent'}}
        onChange={handlefilechange} />
      </div>

      <button className="btn btn-primary mb-3 rounded-pill" onClick={registerDocument}>
        Register Document
      </button>

      {filehash && (
        <div className="alert alert-info">
          <p><strong>File:</strong> {filename}</p>
          <p><strong>File Hash:</strong> {filehash}</p>
        </div>
      )}

      <div>
        <strong>Wallet Address:</strong> {walletAddress ? walletAddress : "Not Connected"}
      </div>
    </div>

    {/* Verify Section */}
    <div className="card p-4 shadow mb-4"
    style={{
        color: darkMode ? '#fff' : '#000',
        border: '1px solid',
        borderColor: darkMode ? '#fff' : '#000',
        backgroundColor: darkMode ? 'transparent' : 'transparent'}}>
      <h5 className="mb-3">Verify Document</h5>
      <button className="btn btn-success rounded-pill" onClick={verifydocument}>
        Verify Document
      </button>
    </div>

    {/* Registered Documents */}
    <div className="card p-4 shadow"
    style={{
        color: darkMode ? '#fff' : '#000',
        border: '1px solid',
        borderColor: darkMode ? '#fff' : '#000',
        backgroundColor: darkMode ? 'transparent' : 'transparent'}}>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h5>Registered Documents</h5>
        <button className="btn btn-outline-primary rounded-pill" onClick={fetchAllDocuments}>
          Show Documents
        </button>
      </div>

      <ul className="list-group">
        {documents?.length > 0 &&
          documents.map((doc, index) => (
            <li key={index} className="list-group-item"
            style={{
        color: darkMode ? '#fff' : '#000',
        border: '1px solid',
        borderColor: darkMode ? '#fff' : '#000',
        backgroundColor: darkMode ? 'transparent' : 'transparent'}}>
              <p><strong>Hash:</strong> {doc.hash}</p>
              <p><strong>Owner:</strong> {doc.owner}</p>
              <p><strong>Timestamp:</strong> {doc.timestamp}</p>
              <button
                className="btn btn-sm btn-outline-secondary rounded-pill"
                onClick={() => documents[doc.hash]?.blobUrl}
              >
                Download
              </button>
              {/* Uncomment below if using uploadedfiles */}
              {/*
              {uploadedfiles[doc.hash] && (
                <a
                  href={uploadedfiles[doc.hash].url}
                  download={uploadedfiles[doc.hash].file.name}
                  className="btn btn-sm btn-link"
                >
                  ⬇️ Download File
                </a>
              )}
              */}
            </li>
          ))}
      </ul>
    </div>
  </div>
);

}
// // download functionality (optional)
// const downloadDocument = (hash) => {
//   alert(`Download triggered for hash: ${hash}`);
// };


export default App;