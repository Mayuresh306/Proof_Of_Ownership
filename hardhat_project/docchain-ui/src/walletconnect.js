import { useEffect, useState } from "react";
import { ethers } from "ethers";
import contractABI from "./abis/ProofOfOwnership.json";

const contractAddress = "0xaA41a5940B8AA529a7648e4AB77EB9bAA297a023";

function WalletConnect() {
  const [account, setAccount] = useState(null);
  const [contract, setContract] = useState(null);

  const connectWallet = async () => {
    if (window.ethereum) {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const address = await signer.getAddress();
      setAccount(address);

      const contractInstance = new ethers.Contract(
        contractAddress,
        contractABI.abi,
        signer
      );
      setContract(contractInstance);
      alert("Wallet connected");
    } else {
      alert("Please install MetaMask!");
    }
  };

  return (
    <div>
      <button onClick={connectWallet}>
        {account ? `Connected: ${account}` : "Connect Wallet"}
      </button>
    </div>
  );
}

export default WalletConnect;