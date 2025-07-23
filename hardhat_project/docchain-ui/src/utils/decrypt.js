import CryptoJS from 'crypto-js';
import { ethers } from 'ethers';

export async function decryptAESKey(encryptedKey, walletAddress) {
  const provider = new ethers.BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();

  const signature = await signer.signMessage(`decrypt-doc:${walletAddress}`);
  const hashKey = CryptoJS.SHA256(signature).toString();

  const decryptedKey = CryptoJS.AES.decrypt(encryptedKey, hashKey).toString(CryptoJS.enc.Utf8);
  return decryptedKey;
}
