const Blockchain = require("./blockchain.js");

let Bitcoin = new Blockchain();
Bitcoin.createNewtransaction("bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh" , "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh" , "2500")
Bitcoin.createNewtransaction("bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh" , "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh" , "2500")
Bitcoin.createNewblock();
console.log(Bitcoin);