// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

contract ProofOfOwnership {
    struct Document {
        string hash;
        address owner;
        uint timestamp;
        string ipfsHash; // Added: IPFS CID
    }

    mapping(string => Document) private documents;
    string[] public DocumentHashes;

    event RegisteredDocument(string hash, address owner, uint timestamp, string ipfsHash);

    function DocumentRegister(string memory _hash, string memory _ipfsHash) public {
        require(documents[_hash].timestamp == 0, "Document already Registered");

        documents[_hash] = Document({
            hash: _hash,
            owner: msg.sender,
            timestamp: block.timestamp,
            ipfsHash: _ipfsHash
        });

        DocumentHashes.push(_hash);

        emit RegisteredDocument(_hash, msg.sender, block.timestamp, _ipfsHash);
    }

    function VerifyDocument(string memory _hash) public view returns (address, uint, string memory) {
        require(documents[_hash].timestamp != 0, "Document not Found");

        Document memory doc = documents[_hash];
        return (doc.owner, doc.timestamp, doc.ipfsHash);
    }

    function getDocument_hashes() public view returns (string[] memory) {
        return DocumentHashes;
    }

    // Optional: get full document info
    function getDocument(string memory _hash) public view returns (string memory, address, uint, string memory) {
        require(documents[_hash].timestamp != 0, "Document not Found");
        Document memory doc = documents[_hash];
        return (doc.hash, doc.owner, doc.timestamp, doc.ipfsHash);
    }
}