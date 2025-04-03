const {ethers} = require('ethers');

const provider = new ethers.JsonRpcProvider('https://eth-sepolia.g.alchemy.com/v2/ILZFTCIzZpUNxp6ScjhRIDxksNEDd2Ye');

async function getbalance(address) {
    const balance = await provider.getbalance(address);
    console.log(ethers.formatEther(balance) , ETH);
}

getbalance(0x3F6FECB35e601fD0266653A806c9ae6434EeCcb3)