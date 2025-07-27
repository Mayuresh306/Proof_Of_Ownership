import CryptoJS from "crypto-js";


export async function fetchAndDecryptFile(ipfsHash, aesKey) {
  const res = await fetch(`https://gateway.pinata.cloud/ipfs/${ipfsHash}`);
  const encryptedData = await res.arrayBuffer();

  const wordArray = CryptoJS.lib.WordArray.create(encryptedData);
  const decrypted = CryptoJS.AES.decrypt(
    { ciphertext: wordArray },
    aesKey
  );

  const decryptedText = decrypted.toString(CryptoJS.enc.Utf8);
  return decryptedText;
}
