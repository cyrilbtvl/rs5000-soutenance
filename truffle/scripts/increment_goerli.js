/*
  Try `truffle exec scripts/increment.js`, you should `truffle migrate` first.

  Learn more about Truffle external scripts: 
  https://trufflesuite.com/docs/truffle/getting-started/writing-external-scripts
*/
async function main() {
  //const ALCHEMY_GOERLI_API_KEY = process.env.ALCHEMY_GOERLI_API_KEY;
  //const PRIVATE_KEY = process.env.PRIVATE_KEY;
  const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS;

  var Web3 = require('web3');
  require('dotenv').config();
  const HDWalletProvider = require('@truffle/hdwallet-provider');
  provider = new HDWalletProvider(`${process.env.MNEMONIC}`, `https://goerli.infura.io/v3/${process.env.INFURA_ID}`)
  web3 = new Web3(provider);

  console.log("CONTRACT_ADDRESS : ", CONTRACT_ADDRESS);

  // contract instance
  const ContractABI = require("../build/contracts/GuarantifyNFTContract.json");
  //console.log("ABI : ", JSON.stringify(ContractABI.abi));

  var GuarantifyNFTContract = new web3.eth.Contract(ContractABI.abi, CONTRACT_ADDRESS);
  //console.log("GuarantifyNFTContract : ", GuarantifyNFTContract);

  //const gcAddress = GuarantifyNFTContract.methods.guarantifyContractAddress();//.call().then(console.log);
  // const gcAddress = (await GuarantifyNFTContract.guarantifyContractAddress());
  //console.log("gcAddress : ", gcAddress);
  console.log("_isSeller : ");
  //const _isSeller = await GuarantifyNFTContract.isSeller("0xCB9D5eF42BBbF7D586aC22b1ef90f74EEdBF5CD1", { from: "0x0E53F5587942585698D7e0bA6a0Ec0999e1587Dc" }).call();
  const _isSeller = await GuarantifyNFTContract.methods.isSeller("0xCB9D5eF42BBbF7D586aC22b1ef90f74EEdBF5CD1...").call();
  console.log("_isSeller : ", _isSeller);

}

main();

/*
  
  // provider - Alchemy
  const alchemyProvider = new ethers.providers.AlchemyProvider(network = "goerli", ALCHEMY_GOERLI_API_KEY);
  console.log("Provider : ");
  
  // signer - you
  const signer = new ethers.Wallet(PRIVATE_KEY, alchemyProvider);
  console.log("signer : ", signer.address);
  
  // contract instance
  const GuarantifyNFTContract = new ethers.ContractABI(CONTRACT_ADDRESS, contract.abi, signer);
  console.log("GuarantifyNFTContract : ", GuarantifyNFTContract);
*/

/*async function main() {
  const guarantifyContractAddress = await GuarantifyNFTContract.guarantifyContractAddress();
  console.log("The contract is deployed at the address : " + guarantifyContractAddress);
}*/


/*
//require('dotenv').config();
//const GuarantifyNFT = artifacts.require("GuarantifyNFT");
module.exports = async function (callback) {
  const deployed = await GuarantifyNFT.deployed();

  // This solves the bug in Mumbai network where the contract address is not the real one
  const txHash = deployed.deployTransaction.hash
  const txReceipt = await ethers.provider.waitForTransaction(txHash)
  const contractAddress = txReceipt.contractAddress
  console.log("Contract deployed to address:", contractAddress)

  callback();
};*/
