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

  let _isConsumer = await GuarantifyNFTContract.methods.isConsumer("0x26e0fDD54BE208Fb05b6EA549082111f918539e4").call();
  console.log("_isConsumer : 0x26e0fDD54BE208Fb05b6EA549082111f918539e4 : ", _isConsumer);
  if (!_isConsumer) {

    try {
      await GuarantifyNFTContract.methods.addConsumer("0x26e0fDD54BE208Fb05b6EA549082111f918539e4").send({
        from: "0x26e0fDD54BE208Fb05b6EA549082111f918539e4"
      }, function (error, transactionHash) {
        // ...
        console.error('--- error addConsumer: ', error);
      });
      callback();
    } catch (error) {
      console.error(error);
      callback(error);
    }

    _isConsumer = await GuarantifyNFTContract.methods.isConsumer("0x26e0fDD54BE208Fb05b6EA549082111f918539e4").call();
    console.log("_isConsumer : 0x26e0fDD54BE208Fb05b6EA549082111f918539e4 : ", _isConsumer);

  }

  const balanceOf = await GuarantifyNFTContract.methods.balanceOf("0x082B269669F9871F7Ae21Bc8FBc61a076D9623f3").call();
  console.log('--- balanceOf before createWarranty : ', balanceOf);
  try {
    const result = await GuarantifyNFTContract.methods.createWarranty("codeGTIN", 123456, "productType", 0, web3.utils.toWei("1", "ether"), "https://gateway.pinata.cloud/ipfs/QmYw2XCfj16HFSgyo8eLU3C3RXQCcRMjY5PHXvwp31gQXa").send({
      from: "0x082B269669F9871F7Ae21Bc8FBc61a076D9623f3"
    }, function (error, transactionHash) {
      // ...

      //console.error('--- error createWarranty: ', error);
    });
    //console.log('--- result : ', result);

    const balanceOf = await GuarantifyNFTContract.methods.balanceOf("0x082B269669F9871F7Ae21Bc8FBc61a076D9623f3").call();
    console.log('--- balanceOf after createWarranty : ', balanceOf);


    try {
      //await GuarantifyNFTContract.methods.burn(1).call();
      //A incrémenter l'id du burn de la transaction
      await GuarantifyNFTContract.methods.burn(4).send({ from: "0x082B269669F9871F7Ae21Bc8FBc61a076D9623f3" }, function (error, transactionHash) {
        //console.error('--- error burn: ', error);
      });


      const balanceOfAfterburn = await GuarantifyNFTContract.methods.balanceOf("0x082B269669F9871F7Ae21Bc8FBc61a076D9623f3").call();
      console.log('--- balanceOf After burn : ', balanceOfAfterburn);

      callback();
    } catch (error) {
      console.error('--- error : ', error);
      callback(error);
    }

    callback();
  } catch (error) {
    console.error(error);
    callback(error);
  }

  callback();
};

//main();