import React , { useState , useEffect } from 'react';
import {ethers, Signature} from 'ethers';
import './App.css';
import crypto, { constants } from 'crypto-browserify';  //for sha256 hashing in browser
import { Buffer } from 'buffer';
import process from 'process';
import contractABI from './abis/ProofOfOwnership.json';
import Login from './Login';
import { uploadToIPFS } from './utils/uploadToipfs.js';
import { Analytics } from '@vercel/analytics/react';
import jsPDF from 'jspdf';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { hash } from 'crypto';
import { encryptFile, getAESKey } from './utils/encryptfile.js';
import { getDecryptionMetadata } from './utils/api.js';
import { decryptFile } from './utils/decrypt.js';
import { fetchAndDecryptFile } from './utils/fetchanddecrypt.js';
import storeMetadata from './utils/api.js';

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
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [encryptedKey , setEncryptedKey] = useState('');
  const [aesKey , setAesKey] = useState("");
  const [EncryptedBlob , setEncryptedBlob] = useState("");

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (stored) setUser(JSON.parse(stored));
  }, [user]);

  const handleLogout = () => {
    localStorage.removeItem("user");
    setUser(null);
    toast.success("Logged out!")
  };

  useEffect(() => {
    document.body.className = darkMode ? 'bg-dark text-light' : 'bg-light text-dark';
  }, [darkMode]);

  // download report 
  const downloadReport = async () => {
    const pdf = new jsPDF();
    const pdfWidth = pdf.internal.pageSize.getWidth();
    let y = 20;

     // Title
  pdf.setFontSize(24);
  pdf.text(" Proof of Ownership Report", 60, y);
  y += 10;

  // Date
  pdf.setFontSize(10);
  pdf.text(`Generated on: ${new Date().toLocaleString()}`, 150, y);
  y += 10;

  // Divider
  pdf.setLineWidth(0.5);
  pdf.line(10, y, pdfWidth - 10, y);
  y += 10;

  // Document List
  pdf.setFontSize(12);

  documents.forEach((doc, index) => {
    if (y > 270) {
      pdf.addPage();
      y = 20;
    }

    pdf.text(`Document ${index + 1}:`, 10, y);
    y += 7;
    pdf.text(`Hash: ${doc.hash}`, 15, y);
    y += 7;
    pdf.text(`Owner: ${doc.owner}`, 15, y);
    y += 7;
    pdf.text(`Timestamp: ${doc.timestamp}`, 15, y);
    y += 10;
  });

  // Footer
  pdf.setFontSize(10);
  pdf.text("© 2025 Proof of Ownership DApp", 10, 295);

  pdf.save("ownership_report.pdf");
  }

  //fetch all the documents
  const fetchAllDocuments = async () => {
    setLoading(true);
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

    // Filter documents belonging to the connected wallet
    const userDocs = documentData.filter(
      (doc) => doc.owner.toLowerCase() === walletAddress.toLowerCase()
    );
    setDocuments(userDocs);
  } catch (error) {
    console.error("Failed to fetch documents:", error);
    setDocuments([]);
  }
  setLoading(false);
};


    // Connect Wallet
  const connectWallet = async () => {
    setLoading(true);
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
        toast.success("Wallet connected successfully!");
      } catch (err) {
        toast.error("Wallet connection failed: " + err.message);
      }
    } else {
      toast.warning("⚠️ MetaMask is not installed");
    }
    setLoading(false);
  };

  // wallet disconnects
  const disconnectWallet = () => {
    setWalletaddress("");  // Clear address
    setContract("");       // Clear contract instance
    toast.success("🔌 Wallet disconnected");
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
    if (!filehash) return toast.warning("select a file!");
    if (!contract) return toast.warning("Connect wallet!");
    if (!Selectedfile) return toast.warning("No file selected!");

    const confirm = window.confirm(
    "⚠️⚠️ NOTE ⚠️⚠️\nAre you sure you want to register this document?\nThis will upload the file to IPFS and record it on the blockchain. You cannot undo this."
    );

    if (!confirm) return; // Stops if user cancels
    setLoading(true);
    try {
      const keyHex = await getAESKey();
      const { encryptedBlob, iv } = await encryptFile(Selectedfile, keyHex);
      const formData = new FormData();
      formData.append("file", encryptedBlob, `encrypted_${Selectedfile.name}`);
      formData.append("metadata", JSON.stringify({ iv }));
      const ipfsHash = await uploadToIPFS(formData);
      setEncryptedKey(iv);
      setIpfsUrl(ipfsHash);
      setAesKey(keyHex);
      setEncryptedBlob(formData);

      const tx = await contract.DocumentRegister(filehash , ipfsHash);
      await tx.wait();
      toast.success("Document Registered Successfully!");
      setLoading(false);
      if (tx) {
        const documentData = {
        walletAddress: walletAddress,
        fileName: Selectedfile.name,
        ipfsHash: ipfsHash,
        encryptedKey: JSON.stringify(iv)
      };
        const result = await storeMetadata(documentData);
        return result;
      }

      setDocuments((prev) => [
      ...prev,
      {
        hash: filehash,
        owner: walletAddress,
        timestamp: new Date().toLocaleString(),
        ipfsUrl : ipfsHash,
      },
    ]);
      setSelectedFile(null);
      fetchAllDocuments(contract);

      

    } catch (err) {
      toast.error("❌ Error!!: " + (err.reason || err.message));
    }
  };

  // Verify document ownership
  const verifydocument = async () => {
    if (!filehash) return toast.warning("select a file first!");
    if (!contract) return toast.warning("Connect wallet First!");
    try {
      const result = await contract.VerifyDocument(filehash);
      const owner = result[0];
      const timestamp = new Date(Number(result[1]) * 1000).toLocaleString();
      const hash  = filehash;
      alert(`#️⃣ Hash: ${hash}\n📄 Owner: ${owner}\n⏱️ Timestamp: ${timestamp}`);
    } catch (err) {
      toast.error("❌ Verification failed: " + (err.reason || err.message));
    }
  };

  const DecryptedFile = async () => {
    const decryptedBlob = await decryptFile(EncryptedBlob, encryptedKey, aesKey);
    const url = URL.createObjectURL(decryptedBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'decrypted_' + filename;
    link.click();
  }

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

    {loading && (
  <div className="text-center my-3">
    <div className="spinner-border text-primary" role="status">
      <span className="visually-hidden">Loading...</span>
    </div>
  </div>
)}


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
    <div className={"fileInput card p-4 shadow mb-4 ${darkMode ? 'bg-secondary text-dark' : 'bg-light'}"}
      style={{
        color: darkMode ? '#fff' : '#000',
        border: '1px solid',
        borderColor: darkMode ? '#fff' : '#000',
        backgroundColor: darkMode ? 'transparent' : 'transparent'}}>
      <h5 className="mb-3 ">Register Document</h5>

      <div className="fileInput mb-3">
        <input type="file" className="fileInput form-control"
        style={{
        color: darkMode ? '#fff' : '#000',
        border: '1px solid',
        borderColor: darkMode ? '#fff' : '#000',
        backgroundColor: darkMode ? 'transparent' : 'transparent'}}
        onChange={handlefilechange} />
      </div>

      <button className="btn btn-primary mb-3 rounded-pill" onClick={registerDocument}>
        Register the Document
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
        <input
  type="text"
  className="form-control mb-2 rounded-pill"
  style={{
        color: darkMode ? '#fff' : '#000',
        border: '1px solid',
        borderColor: darkMode ? '#fff' : '#000',
        backgroundColor: darkMode ? 'transparent' : 'transparent'}}
  placeholder="🔍 Search by hash or owner..."
  value={searchQuery}
  onChange={(e) => setSearchQuery(e.target.value)}
/>
        <button className="btn btn-outline-info rounded-pill mt-6"
        title={' Download Ownership Report (PDF)'} 
         onClick={!walletAddress ? (null) : downloadReport}>
   📥
</button>
        <button onClick={DecryptedFile}>
          decrypt the file
        </button>
        <button className="btn btn-outline-primary rounded-pill" onClick={fetchAllDocuments}>
          Show Documents
        </button>
      </div>
    <div id='ownership-report'>
    <ul className="list-group">
  {documents?.length > 0 ? (
    documents
  .filter((doc) =>
    doc.hash.toLowerCase().includes(searchQuery.toLowerCase()) ||
    doc.owner.toLowerCase().includes(searchQuery.toLowerCase())
  ).map((doc, index) => (
      <li key={index} className="list-group-item"
        style={{
          color: darkMode ? '#fff' : '#000',
          border: '1px solid',
          borderColor: darkMode ? '#fff' : '#000',
          backgroundColor: darkMode ? 'transparent' : 'transparent',
        }}>
        <p style={{color: 'grey'}}><strong>Hash:</strong> {doc.hash}
        <button
      className="btn btn-sm btn-outline-secondary ms-2 rounded-pill"
      onClick={() => {navigator.clipboard.writeText(doc.hash)
        toast.success("copied to clipboard")
      }}
      title="Copy to clipboard"
    >
       copy
    </button>
        </p>
        <p style={{color: 'grey'}}><strong>Owner:</strong> {doc.owner}</p>
        <p style={{color: 'grey'}}><strong>Timestamp:</strong> {doc.timestamp}</p>
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
    ))
  ) : (
    <li className="list-group-item text-center rounded pill"
      style={{
        color: darkMode ? '#fff' : '#000',
        backgroundColor: darkMode ? 'transparent' : 'transparent',
        borderColor: darkMode ? '#fff' : '#000',
      }}>
      No documents found 😔
    </li>
  )}
</ul>
<ToastContainer position="top-right" autoClose={3000} />
</div>

  </div>
  <Analytics />
  </div>

);
}

export default App;