const Blockchain = require("./blockchain.js");

let Bitcoin = new Blockchain();
Bitcoin.createNewtransaction("bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh" , "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh" , "2500")
Bitcoin.createNewblock();
Bitcoin.createNewtransaction("bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh" , "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh" , "25")
Bitcoin.createNewblock();
Bitcoin.createNewtransaction("bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh" , "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh" , "984392")
Bitcoin.createNewblock();
Bitcoin.GetlastBlock();
console.log(Bitcoin);
