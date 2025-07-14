import React , { useState , useEffect } from 'react';
import {ethers} from 'ethers';
import './App.css';
import crypto, { constants } from 'crypto-browserify';  //for sha256 hashing in browser
import { Buffer } from 'buffer';
import process from 'process';
import contractABI from './abis/ProofOfOwnership.json';
import Login from './Login';
import { uploadToIPFS } from './utils/uploadToipfs.js';

window.Buffer = Buffer;
window.process = process;

const contractAddress = "0x7Decca95a85DA4F9E2ECF181cf138fd03113aDE3";

function App() {
  const [walletAddress , setWalletaddress] = useState("");
  const [contract , setContract] = useState("");
  const [filehash , setfilehash] = useState('');
  const [filename , setfilename] = useState('');
  const [documents , setDocuments ] = useState([]);
  const [uploadedfiles , setUploadedFiles] = useState({});
  const [darkMode , setDarkMode] = useState(false);
  const [user, setUser] = useState(null);
  const [Selectedfile , setSelectedFile] = useState(null);
  const [IpfsUrl , setIpfsUrl] = useState(null);
  const [registeredDocs, setRegisteredDocs] = useState([]);


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
        const [owner , timestamp , ipfsHash] = await contract.VerifyDocument(hash);
        return {
          hash,
          owner,
          timestamp : new Date(Number(timestamp) * 1000).toLocaleString(),
          ipfsHash,
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

  // wallet disconnects
  const disconnectWallet = () => {
    setWalletaddress("");  // Clear address
    setContract("");       // Clear contract instance
    alert("🔌 Wallet disconnected");
};


    // file to hash
  const handlefilechange = async (e) => {
    const file  = e.target.files[0];
    setSelectedFile(file);
    if(!file) return;
    setfilename(file.name);

    const reader = new FileReader();
    reader.onload = async function (event) {
      const buffer = event.target.result;
      const hashBuffer = await window.crypto.subtle.digest('SHA-256', buffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
      setfilehash(hashHex);
    };
    reader.readAsArrayBuffer(file);
    };

  // smart contract functions interaction
  // Register document on blockchain
  const registerDocument = async () => {
    if (!filehash) return alert("select a file first!");
    if (!contract) return alert("Connect wallet First!");
    if (!Selectedfile) return alert("No file selected!");

    const confirm = window.confirm(
    "⚠️⚠️ NOTE ⚠️⚠️\nAre you sure you want to register this document?\nThis will upload the file to IPFS and record it on the blockchain. You cannot undo this."
    );

    if (!confirm) return; // Stop if user cancels
    try {
      const ipfsHash = await uploadToIPFS(Selectedfile);
      setIpfsUrl(ipfsHash);

      const tx = await contract.DocumentRegister(filehash , ipfsHash);
      await tx.wait();
      alert("✅ Document Registered Successfully!");

      setDocuments((prev) => [
      ...prev,
      {
        hash: filehash,
        owner: walletAddress,
        timestamp: new Date().toLocaleString(),
        ipfsUrl : ipfsHash,
      },
    ]);
      // setfilehash("");
      // setfilename("");
      setSelectedFile(null);
      fetchAllDocuments(contract);
    } catch (err) {
      alert("❌ Error!!: " + (err.reason || err.message));
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
      <span className=" me-2"
      style={{
    color: darkMode ? '#fff' : '#000'}}>
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
   {walletAddress ? (
  <>
    <button className="btn btn-sm btn-outline-danger rounded-pill me-2" onClick={disconnectWallet}>
      🔌 Disconnect
    </button>
    <span style={{ color: darkMode ? '#fff' : '#000' }}>
      ✅ Connected: {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
    </span>
  </>
) : (
  <button
    className="btn btn-sm btn-outline-primary rounded-pill"
    onClick={connectWallet}>
    🔗 Connect Wallet
    </button>
)}
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
    backgroundColor: darkMode ? 'transparent' : 'transparent',
  }}>
        <p><strong>Hash:</strong> {doc.hash}</p>
        <p><strong>Owner:</strong> {doc.owner}</p>
        <p><strong>Timestamp:</strong> {doc.timestamp}</p>
        {doc.ipfsHash && (
          <a
            href={doc.ipfsHash}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-success rounded-pill"
            download
          >
            📥 Download File
          </a>
        )}
      </li>
    ))}
</ul>
  </div>
  </div>
);
}

export default App;