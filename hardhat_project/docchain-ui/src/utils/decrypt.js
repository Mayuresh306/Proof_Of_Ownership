import CryptoJS from 'crypto-js';

export const decryptFile = (encryptedBlob, ivHex, aesKeyHex) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (event) => {
      try {
        // 1. Get encrypted bytes from ArrayBuffer
        const encryptedArrayBuffer = event.target.result;
        const encryptedBytes = new Uint8Array(encryptedArrayBuffer);

        // 2. Convert encryptedBytes to WordArray using CryptoJS helper
        const encryptedWordArray = CryptoJS.lib.WordArray.create(encryptedBytes);

        // 3. Decode hex IV and key
        const iv = CryptoJS.enc.Hex.parse(ivHex);
        const aesKey = CryptoJS.enc.Hex.parse(aesKeyHex);

        // 4. Decrypt
        const decrypted = CryptoJS.AES.decrypt(
          { ciphertext: encryptedWordArray },
          aesKey,
          { iv: iv, mode: CryptoJS.mode.CBC, padding: CryptoJS.pad.Pkcs7 }
        );

        // 5. Convert decrypted WordArray to Uint8Array
        const decryptedBytes = CryptoJS.enc.Utf8.stringify(decrypted); // assuming file is text-based

        // If it's binary (e.g., PDF, image), we convert to binary array
        const decryptedWordArray = decrypted;
        const byteArray = new Uint8Array(decrypted.sigBytes);
        for (let i = 0; i < decrypted.sigBytes; i++) {
          byteArray[i] = (decryptedWordArray.words[Math.floor(i / 4)] >> (24 - (i % 4) * 8)) & 0xff;
        }

        // 6. Create Blob and resolve
        const decryptedBlob = new Blob([byteArray]);
        resolve(decryptedBlob);

      } catch (err) {
        reject(err);
      }
    };

    reader.onerror = (err) => reject(err);
    reader.readAsArrayBuffer(encryptedBlob);
  });
};









// import CryptoJS from 'crypto-js';
// import { ethers } from 'ethers';

// export async function decryptAESKey(encryptedKey, walletAddress) {
//   const provider = new ethers.BrowserProvider(window.ethereum);
//   const signer = await provider.getSigner();

//   const signature = await signer.signMessage(`decrypt-doc:${walletAddress}`);
//   const hashKey = CryptoJS.SHA256(signature).toString();

//   const decryptedKey = CryptoJS.AES.decrypt(encryptedKey, hashKey).toString(CryptoJS.enc.Utf8);
//   return decryptedKey;
// }
