import React , { useState } from 'react';
import {ethers} from 'ethers';
import './App.css';
import crypto from 'crypto-browserify'  //for sha256 hashing in browser

function App() {
  const [filehash , setfilehash] = useState('');
  const [filename , setfilename] = useState('');

  const handlefilechange = async (e) => {
    const file  = e.target.files[0];
    if(!file) return;
    setfilename(file.name);

    const reader = new FileReader();
    reader.onload = async (event) => {
      const buffer = event.target.result;
      const hash = crypto.createHash('sha256').update(new Uint8Array(buffer)).digest('hex');
      setfilehash(hash);
    };
    reader.readAsArrayBuffer(file);
  };

  return (
    <div className='App'>
      <h1>DocChain</h1>
      <input type='file' onChange={handlefilechange} />
      {filehash && (
        <>
        <p><strong>File:</strong> {filename}</p>
        <p><strong>SHA-256 Hash:</strong> {filehash}</p>
        </>
      )}
    </div>
  );
}

export default App;