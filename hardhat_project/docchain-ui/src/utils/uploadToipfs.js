const PINATA_JWT = 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiI2YjlhNDVmNS1jNTYxLTQxNmQtOTFhZi00ZDYwNDk3ZTkyMWIiLCJlbWFpbCI6Im1heXVyZXNocmVkZHkyMDA2QGdtYWlsLmNvbSIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJwaW5fcG9saWN5Ijp7InJlZ2lvbnMiOlt7ImRlc2lyZWRSZXBsaWNhdGlvbkNvdW50IjoxLCJpZCI6IkZSQTEifSx7ImRlc2lyZWRSZXBsaWNhdGlvbkNvdW50IjoxLCJpZCI6Ik5ZQzEifV0sInZlcnNpb24iOjF9LCJtZmFfZW5hYmxlZCI6ZmFsc2UsInN0YXR1cyI6IkFDVElWRSJ9LCJhdXRoZW50aWNhdGlvblR5cGUiOiJzY29wZWRLZXkiLCJzY29wZWRLZXlLZXkiOiJjZmVlYTY1YTdlOWY0YmEzOTkwNiIsInNjb3BlZEtleVNlY3JldCI6ImY3NTU5YTRjNDBkYjRiNWNhOGJiNmMyMzk4NWQ4YjU0MGNmZTkyNzdhYjhhNTU4Y2JkOTc3OTU4MGQ5ODk4YzEiLCJleHAiOjE3ODM4NjQ1ODZ9.zAk48euLi8zqGG8KrQ-M7_VbIyPQmzugGlHP-8CfK20';

export const uploadToIPFS = async (file) => {
  if (!file) throw new Error("No file provided for IPFS upload.");
  
  const formData = new FormData();
  formData.append('file', file);

  try {
    const response = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
      method: 'POST',
      body: formData,
      headers: {
        Authorization: PINATA_JWT,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    const ipfsHash = data.IpfsHash;
    return `https://gateway.pinata.cloud/ipfs/${ipfsHash}`;
    
  } catch (error) {
    console.error('Error uploading to IPFS via Pinata:', error);
    throw error;
  }
};