import React , { useState } from 'react';
import {ethers} from 'ethers';
import './App.css';
import crypto, { constants } from 'crypto-browserify'  //for sha256 hashing in browser
import { Buffer } from 'buffer';
window.Buffer = Buffer;

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
      const hashBuffer = await window.crypto.subtle.digest('SHA-256' , buffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashHex = hashArray.map(b => b.toString(16).padStart
    (2 , '0')).join('');
      setfilehash(hashHex);
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
        <p><strong>Hash:</strong> {filehash}</p>
        </>
      )}
    </div>
  );
}

export default App;