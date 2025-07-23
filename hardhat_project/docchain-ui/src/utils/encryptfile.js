import CryptoJS from 'crypto-js';
import { ethers } from 'ethers';


export async function getAESKey() {
  const provider = new ethers.BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();

  const message = "Sign this message to generate your encryption key for document ownership.";
  const signature = await signer.signMessage(message);

  // Hash the signature to generate a consistent AES key
  const hash = CryptoJS.SHA256(signature);
  return hash.toString(CryptoJS.enc.Hex);
}


export async function encryptFile(file, keyHex) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      try {
        // Convert ArrayBuffer to WordArray
        const wordArray = CryptoJS.lib.WordArray.create(reader.result);

        const iv = CryptoJS.lib.WordArray.random(16); // generate random IV

        // Encrypt
        const encrypted = CryptoJS.AES.encrypt(wordArray, CryptoJS.enc.Hex.parse(keyHex), {
          iv: iv,
          mode: CryptoJS.mode.CBC,
          padding: CryptoJS.pad.Pkcs7,
        });

        // Convert to Uint8Array (raw encrypted data)
        const encryptedBase64 = encrypted.toString(); // Base64 string
        const encryptedWordArray = CryptoJS.enc.Base64.parse(encryptedBase64);
        const encryptedBytes = new Uint8Array(encryptedWordArray.words.length * 4);

        for (let i = 0; i < encryptedWordArray.words.length; i++) {
          const word = encryptedWordArray.words[i];
          encryptedBytes[i * 4] = (word >> 24) & 0xff;
          encryptedBytes[i * 4 + 1] = (word >> 16) & 0xff;
          encryptedBytes[i * 4 + 2] = (word >> 8) & 0xff;
          encryptedBytes[i * 4 + 3] = word & 0xff;
        }

        const encryptedBlob = new Blob([encryptedBytes], { type: file.type });

        resolve({
          encryptedBlob,
          iv: CryptoJS.enc.Hex.stringify(iv), // returns IV as hex string
        });
      } catch (err) {
        reject(err);
      }
    };

    reader.onerror = (err) => reject(err);
    reader.readAsArrayBuffer(file);
  });
}





// export async function signMessageAndGetAESKey() {
//   if (!window.ethereum) throw new Error("MetaMask not found!");

//   const provider = new ethers.BrowserProvider(window.ethereum);
//   const signer = await provider.getSigner();

//   const address = await signer.getAddress();
//   const message = `Authorize file encryption for wallet: ${address}`;
//   const signature = await signer.signMessage(message);

//   const Aeskey = sha256(signature).toString(encHex); // 256-bit AES key in hex
//   return Aeskey;
// }
