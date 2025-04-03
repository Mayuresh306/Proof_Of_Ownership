const {SHA256} = require('crypto-js');

// const hash = new sha256("man").digest("hex").toString();
// console.log(hash);
// let Hash = "";
// let nonce = 0;

// while (Hash.substring(0 , 3) !== "000") {
//     nonce++;
//     Hash = SHA256("man"+nonce).toString();
// }

// console.log(Hash);
// console.log(nonce);



class Blockchain {
    constructor() {
        this.chain = [this.creategenesisblock()];
        this.pendingtransactions = [];
    }
    creategenesisblock() {
        return {
            index : 1,
            timestamp : Date.now(),
            transactions : [],
            nonce : 0,
            hash : "hash",
            previousHash : "previousHash"
        }
    }

    GetlastBlock() {
        return this.chain[this.chain.length - 1];
    }

    generateHash(previousHash , timestamp , pendingtransactions) {
        let hash = "";
        let nonce = 0;
        while (hash.substring(0 , 4) !== "0000") {
            nonce++;
            hash = SHA256(previousHash + timestamp + JSON.stringify(pendingtransactions) + nonce).toString();
        }
        return {hash , nonce};
    }

    createNewtransaction(sender , recipient , amount) {
        const newtransaction = {
            sender,
            recipient,
            amount,
        };
        this.pendingtransactions.push(newtransaction);
    }

    createNewblock() {
        const timestamp = Date.now();
        const transactions = this.pendingtransactions;
        const previousHash = this.GetlastBlock().hash;
        const generateHash = this.generateHash(previousHash , timestamp , transactions);
        const NewBlock = {
            index : this.chain.length+1,
            timestamp,
            transactions,
            nonce : generateHash.nonce,
            difficulty : 10,
            hash : generateHash.hash,
            previousHash,
        };

        this.pendingtransactions = [];
        this.chain.push(NewBlock);
        return NewBlock;
    }
}
module.exports = Blockchain;
