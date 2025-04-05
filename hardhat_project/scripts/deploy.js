const {ethers} = require("hardhat");

async function main() {
    const ProofOfOwnership = await ethers.getContractfactory("ProofOfOwnership");
    const contract = await ProofOfOwnership.deploy();
    await contract.waitForDeployment();
    console.log("Contract Deployed Successfully to " , contract.target);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
    
});