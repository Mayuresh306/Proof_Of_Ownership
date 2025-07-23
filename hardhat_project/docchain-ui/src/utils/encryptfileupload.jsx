import * as React from 'react';
import { getAESKey , encryptFile } from './encryptfile';

const EncryptUpload = () => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [encryptedUrl, setEncryptedUrl] = useState(null);

  const handleFileChange = (e) => {
    if (e.target.files?.[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleEncryptAndUpload = async () => {
    if (!file) return;
    try {
      setLoading(true);

      const key = await getAESKey();
      const encryptedBlob = await encryptFile(file, key);

      // Upload encryptedBlob to IPFS or any server
      const formData = new FormData();
      formData.append("file", encryptedBlob, file.name);

      const response = await fetch("https://api.pinata.cloud/pinning/pinFileToIPFS", {
        method: "POST",
        headers: {
          Authorization: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiI2YjlhNDVmNS1jNTYxLTQxNmQtOTFhZi00ZDYwNDk3ZTkyMWIiLCJlbWFpbCI6Im1heXVyZXNocmVkZHkyMDA2QGdtYWlsLmNvbSIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJwaW5fcG9saWN5Ijp7InJlZ2lvbnMiOlt7ImRlc2lyZWRSZXBsaWNhdGlvbkNvdW50IjoxLCJpZCI6IkZSQTEifSx7ImRlc2lyZWRSZXBsaWNhdGlvbkNvdW50IjoxLCJpZCI6Ik5ZQzEifV0sInZlcnNpb24iOjF9LCJtZmFfZW5hYmxlZCI6ZmFsc2UsInN0YXR1cyI6IkFDVElWRSJ9LCJhdXRoZW50aWNhdGlvblR5cGUiOiJzY29wZWRLZXkiLCJzY29wZWRLZXlLZXkiOiJjZmVlYTY1YTdlOWY0YmEzOTkwNiIsInNjb3BlZEtleVNlY3JldCI6ImY3NTU5YTRjNDBkYjRiNWNhOGJiNmMyMzk4NWQ4YjU0MGNmZTkyNzdhYjhhNTU4Y2JkOTc3OTU4MGQ5ODk4YzEiLCJleHAiOjE3ODM4NjQ1ODZ9.zAk48euLi8zqGG8KrQ-M7_VbIyPQmzugGlHP-8CfK20`,
        },
        body: formData,
      });

      const result = await response.json();
      setEncryptedUrl(`https://gateway.pinata.cloud/ipfs/${result.IpfsHash}`);
    } catch (error) {
      console.error("Encryption/Upload failed", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 border rounded-md w-fit">
      <h2 className="text-lg font-bold mb-2">Encrypt & Upload File</h2>
      <input type="file" onChange={handleFileChange} className="mb-2" />
      <button
        onClick={handleEncryptAndUpload}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
        disabled={loading || !file}
      >
        {loading ? 'Encrypting...' : 'Encrypt & Upload'}
      </button>
      {encryptedUrl && (
        <p className="mt-4 break-all">Encrypted file: <a href={encryptedUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">{encryptedUrl}</a></p>
      )}
    </div>
  );
};

export default EncryptUpload;
