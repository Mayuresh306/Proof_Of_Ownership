# 📄 Proof of Ownership DApp

A decentralized application (DApp) that allows users to securely **register**, **verify**, and **download** documents on the **Ethereum blockchain** using **IPFS** for decentralized storage.

---

## 🌐 Live Demo

🔗 [proof-of-ownership.vercel.app](https://proof-of-ownership-mayureshwar-reddys-projects.vercel.app/)

---

## ⚙️ Tech Stack

- **Frontend:** React, Bootstrap
- **Smart Contract:** Solidity, Hardhat
- **Blockchain:** Ethereum (Testnet)
- **File Storage:** IPFS (via Pinata)
- **Wallet Integration:** MetaMask
- **Deployment:** Vercel

---

## 🚀 Features

- 🔐 SHA-256 hashing of uploaded documents
- 🌍 Stores IPFS hash on Ethereum blockchain
- 📁 Files uploaded to IPFS only *after* transaction confirmation
- ✅ Document verification by hash
- 📥 Download registered documents from IPFS
- 🔌 MetaMask wallet integration (Connect/Disconnect)
- 🌗 Light/Dark theme toggle
- 👨‍💼 Simple login system for demo users

---

## 🛠️ How to run the Project

## ✅ Prerequisites

Before running this project locally, ensure you have the following installed:

### 🔧 Tools & Libraries

| Tool              | Required Version | Purpose                            |
|------------------|------------------|------------------------------------|
| [Node.js](https://nodejs.org/)      | `>= v16`         | JavaScript runtime environment     |
| [npm](https://www.npmjs.com/)       | `>= v8`          | Package manager for Node.js        |
| [Metamask](https://metamask.io/)    | Extension        | Ethereum wallet for user login     |
| [Pinata](https://pinata.cloud/)     | API Key/JWT      | IPFS file storage                  |
| [Hardhat](https://hardhat.org/)     | Local only       | Compile & deploy smart contracts   |
| [Vercel](https://vercel.com/)       | Optional         | For frontend deployment            |

---

### 🔑 API Access

- **Pinata JWT Token** is required for uploading files to IPFS. Store it securely.
  > You can get one by signing up at [pinata.cloud](https://pinata.cloud) and generating an API Key.

### 💻 Metamask Setup

- Ensure MetaMask is connected to your chosen network (e.g., **Sepolia testnet**).
- Fund the wallet with test ETH for deploying and interacting with the smart contract.

---

### 1. Clone the Repository

- git clone https://github.com/yourusername/proof-of-ownership.git
- cd proof-of-ownership

### 2. Install Dependencies
- npm install

### 3. Setup Environment
- Create a .env file in the root directory and add your Pinata JWT token:
- REACT_APP_PINATA_JWT=Bearer YOUR_PINATA_JWT_TOKEN

### 4. Start the Frontend
- npm start

### 5. 💻 Smart Contract
- Located in:
/smart_contract/ProofOfOwnership.sol

### 6. Compile & Deploy
- Use Hardhat to compile and deploy to your preferred Ethereum testnet:
npx hardhat compile
npx hardhat run scripts/deploy.js --network sepolia
Don't forget to update the contract address in your frontend code.

### 7. Usage Instructions
- Login / Signup with email and password
- Connect your MetaMask wallet
- Upload a document to register its hash and store it on IPFS
- Verify a document by re-uploading it
- Download files that are registered and stored on IPFS
- Logout or Disconnect Wallet when done

### 8. 📦 Deployment (Optional)
This project is deployed using Vercel. To deploy:
- Push your repo to GitHub
- Import it into Vercel
- Add the REACT_APP_PINATA_JWT as an environment variable

👆Click Deploy

-------------

🙋‍♂️ Author/Developer
- Mayureshwar Reddy
- 📬 [LinkedIn](https://www.linkedin.com/in/mayureshwar-reddy-37a4a2342?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app)
- 📍 Kalyan, Maharashtra
- 📧 mayureshreddy2006@gmail.com

📜 License
- MIT License © 2025
- Mayureshwar Reddy
