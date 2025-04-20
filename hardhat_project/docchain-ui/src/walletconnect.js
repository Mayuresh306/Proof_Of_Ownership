import { useState , useEffect} from 'react';
import { ethers } from 'ethers';

function WalletConnect({ setWalletaddress}) {
    const [isConnected , setIsConnected] = useState(false);
    useEffect(() => {
        if(window.ethereum) {
            window.ethereum.on("AccountsChanged" , handleAccountsChanged);
        }
    } , []);
    const handleAccountsChanged = (accounts) => {
        if(accounts.length > 0) {
            setWalletaddress(accounts[0]);
                setIsConnected(true);
        }else {
            setIsConnected(false);
        }
    };

    const connectWallet = async () => {
        if (window.ethereum) {
            const accounts = await window.ethereum.request({method:'eth_requestAccounts'});

            handleAccountsChanged(accounts);
        } else {
            alert ("Please install Metamask");
        }
    };

    return (
        <div>
            <button onClick={connectWallet}>{isConnected ? "Wallet Connected" : "Connect Wallet"}
            </button>
        </div>
    );
}

export default WalletConnect;