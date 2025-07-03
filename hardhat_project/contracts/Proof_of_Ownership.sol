// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

contract ProofOfOwnership {
    struct Document {
        string hash;
        address owner;
        uint timestamp;
    }

    mapping(string => Document) private documents;
    string[] public DocumentHashes;

    event RegisteredDocument(string hash , address owner , uint timestamp);

    function DocumentRegister(string memory _hash) public {
        require(documents[_hash].timestamp == 0 , "Document already Registered" );
        documents[_hash] = Document({
            hash: _hash,
            owner: msg.sender,
            timestamp: block.timestamp
        });
        DocumentHashes.push(_hash);

        emit RegisteredDocument(_hash , msg.sender , block.timestamp);
    }


    function VerifyDocument(string memory _hash) public view returns(address , uint) {
        require(documents[_hash].timestamp != 0 , "Document not Found");

        Document memory doc = documents[_hash];
        return (doc.owner , doc.timestamp);
    }

    function getDocument_hashes() public view returns(string[] memory) {
        return DocumentHashes;
    }
}

