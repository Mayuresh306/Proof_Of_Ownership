
export async function storeMetadata(DocumentData) {
  try {
    const res = await fetch("http://localhost:5000/api/store-metadata", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(DocumentData)
    });

    const data = await res.json();
    if (res.ok) {
      console.log("✅ Metadata stored:", data.message);
    } else {
      console.error("❌ Error storing metadata:", data.error);
    }
  } catch (err) {
    console.error("❌ API Error:", err);
  }
}


export async function getUserMetadata(walletAddress) {
  try {
    const res = await fetch("http://localhost:5000/api/get-metadata", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ walletAddress })
    });

    const data = await res.json();
    if (res.ok) {
      return data.metadata; // array of metadata
    } else {
      console.error("Error fetching metadata:", data.error);
      return [];
    }
  } catch (err) {
    console.error("API error:", err);
    return [];
  }
}


export async function getDecryptionMetadata(walletAddress, fileName) {
  const res = await fetch('http://localhost:5000/api/decrypt-metadata', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ walletAddress, fileName }),
  });

  if (!res.ok) throw new Error('Failed to fetch metadata');
  return res.json();
}

export default storeMetadata;