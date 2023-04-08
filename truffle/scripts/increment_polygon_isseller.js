/*
  Try `truffle exec scripts/increment.js`, you should `truffle migrate` first.

  Learn more about Truffle external scripts: 
  https://trufflesuite.com/docs/truffle/getting-started/writing-external-scripts
*/
module.exports = async function (callback) {
  //async function main() {
  const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS;

  var Web3 = require('web3');
  require('dotenv').config();
  const HDWalletProvider = require('@truffle/hdwallet-provider');
  provider = new HDWalletProvider(`${process.env.MNEMONIC}`, `https://polygon-mumbai.g.alchemy.com/v2/${process.env.ALCHEMY_POLYGON_API_KEY}`)
  web3 = new Web3(provider);

  console.log("CONTRACT_ADDRESS : ", CONTRACT_ADDRESS);

  // contract instance
  const ContractABI = require("../build/contracts/GuarantifyNFTContract.json");
  var GuarantifyNFTContract = new web3.eth.Contract(ContractABI.abi, CONTRACT_ADDRESS);

  let _isSeller = await GuarantifyNFTContract.methods.isSeller(CONTRACT_ADDRESS).call();
  console.log("_isSeller CONTRACT_ADDRESS : ", _isSeller);

  _isSeller = await GuarantifyNFTContract.methods.isSeller("0x082B269669F9871F7Ae21Bc8FBc61a076D9623f3").call();
  console.log("_isSeller : 0x082B269669F9871F7Ae21Bc8FBc61a076D9623f3 : ", _isSeller);

  if (!_isSeller) {

    try {
      await GuarantifyNFTContract.methods.addSeller("0x082B269669F9871F7Ae21Bc8FBc61a076D9623f3").send({
        from: "0x082B269669F9871F7Ae21Bc8FBc61a076D9623f3"
      }, function (error, transactionHash) {
        // ...
        console.error('--- error addSeller: ', error);
      });
      callback();
    } catch (error) {
      console.error(error);
      callback(error);
    }

    _isSeller = await GuarantifyNFTContract.methods.isSeller("0x082B269669F9871F7Ae21Bc8FBc61a076D9623f3").call();
    console.log("_isSeller : 0x082B269669F9871F7Ae21Bc8FBc61a076D9623f3 : ", _isSeller);

  }


  callback();
};

//main();