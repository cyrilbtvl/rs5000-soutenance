const GuarantifyNFTContract = artifacts.require("GuarantifyNFTContract");
const ethers = require('ethers');
const { BN, expectRevert, expectEvent } = require('@openzeppelin/test-helpers');
const { expect } = require('chai');

contract("GuarantifyNFTContract", (accounts) => {
  let contractInstance;
  const sellerA = accounts[0];
  const consumerA = accounts[1];
  const consumerB = accounts[2];
  const sellerB = accounts[3];

  describe('As user of Dapp, I should be able to add or delete my seller account', () => {

    beforeEach(async () => {
      contractInstance = await GuarantifyNFTContract.new();
    });

    it("should add a seller", async () => {
      // Call the addSeller function
      await contractInstance.addSeller(sellerA, { from: sellerA });

      // Verify that the seller was added
      const isSeller = await contractInstance.isSeller(sellerA);
      expect(isSeller).to.equal(true);
    });

    
    it('Should return an error when seller wants add an another seller', async function () {
      // Add the seller
      await expectRevert(contractInstance.addSeller(sellerA, { from: sellerB }), 'Only the owner of the account can add it');

      // Verify that the seller was added
      const isSeller = await contractInstance.isSeller(sellerA);
      expect(isSeller).to.equal(false);
    });

    it('Should return an error when seller already add', async function () {
      // Call the addSeller function
      await contractInstance.addSeller(sellerA, { from: sellerA });
      // Add the seller
      await expectRevert(contractInstance.addSeller(sellerA, { from: sellerA }), 'VM Exception while processing transaction: revert Seller already added -- Reason given: Seller already added.');

      // Verify that the seller was added
      const isSeller = await contractInstance.isSeller(sellerA);
      expect(isSeller).to.equal(true);
    });

    it("should remove a seller", async () => {
      // Add the seller
      await contractInstance.addSeller(sellerA, { from: sellerA });

      // Call the removeSeller function
      await contractInstance.removeSeller(sellerA, { from: sellerA });

      // Verify that the seller was removed
      const isSeller = await contractInstance.isSeller(sellerA);
      expect(isSeller).to.equal(false);
    });

    it('Should return an error when seller wants remove an another seller', async function () {
      // Add the seller
      await contractInstance.addSeller(sellerA, { from: sellerA });

      // Call the removeSeller function
      await expectRevert(contractInstance.removeSeller(sellerA, { from: sellerB }), 'Only the owner of the account can delete it');

      // Verify that the seller was added
      const isSeller = await contractInstance.isSeller(sellerA);
      expect(isSeller).to.equal(true);
    });
    
  });


  describe('As user of Dapp, I should be able to add or delete my consumer account', () => {

    beforeEach(async () => {
      guarantifyNFTContractInstance = await GuarantifyNFTContract.new();
    });

    // Tester la fonction addConsumer
      it("devrait ajouter un consommateur", async () => {
        await guarantifyNFTContractInstance.addConsumer(consumerA, { from: consumerA });
        const isConsumer = await guarantifyNFTContractInstance.isConsumer(consumerA);
        expect(isConsumer).to.equal(true);
      });
    
      it('Should return an error when a consumer wants add an another consumer', async function () {
        // Add the seller
        await expectRevert(guarantifyNFTContractInstance.addConsumer(consumerA, { from: consumerB }), 'Only the owner of the account can add it');

        // Verify that the seller was added
        const isConsumer = await guarantifyNFTContractInstance.isConsumer(consumerA);
        expect(isConsumer).to.equal(false);
      });
    
      it('Should return an error when consumer already add', async function () {
        // Call the addConsumer function
        await guarantifyNFTContractInstance.addConsumer(consumerA, { from: consumerA });
       
        // Add the seller
        await expectRevert(guarantifyNFTContractInstance.addConsumer(consumerA, { from: consumerA }), 'VM Exception while processing transaction: revert Consumer already added -- Reason given: Consumer already added.');
  
        // Verify that the seller was added
        const isConsumer = await guarantifyNFTContractInstance.isConsumer(consumerA);
        expect(isConsumer).to.equal(true);
      });
    
      // Tester la fonction removeConsumer
      it("devrait supprimer un consommateur", async () => {
        await guarantifyNFTContractInstance.addConsumer(consumerA, { from: consumerA });
        await guarantifyNFTContractInstance.removeConsumer(consumerA, { from: consumerA });
        const isConsumer = await guarantifyNFTContractInstance.isConsumer(consumerA);
        expect(isConsumer).to.equal(false);
      });

      it('Should return an error when a consumer wants remove an another consumer', async function () {
        // Add the consuler
        await guarantifyNFTContractInstance.addConsumer(consumerA, { from: consumerA });

        // Call the removeConsumer function
        await expectRevert(guarantifyNFTContractInstance.removeConsumer(consumerA, { from: consumerB }), 'Only the owner of the account can delete it');

        // Verify that the seller was added
        const isConsumer = await guarantifyNFTContractInstance.isConsumer(consumerA);
        expect(isConsumer).to.equal(true);
      });
  });
  
  describe('As a seller, I should be able to create a NFT', () => {

    beforeEach(async () => {
      guarantifyNFTContractInstance = await GuarantifyNFTContract.new();
    });

    it("should create a new warranty with valid details", async () => {
      const codeGTIN = "4556545698745";
      const invoiceNumber = new BN("12345");
      const productType = "Product Type";
      const warrantyDuration = new BN("365");
      const purchaseDate = new BN(Date.now());
      const price = new BN("100");

      // Call the addSeller function
      await guarantifyNFTContractInstance.addSeller(sellerA, { from: sellerA });

      // Verify that the seller was added
      const isSeller = await guarantifyNFTContractInstance.isSeller(sellerA);
      expect(isSeller).to.equal(true);

      const result = await guarantifyNFTContractInstance.createWarranty(
        codeGTIN,
        invoiceNumber,
        productType,
        warrantyDuration,
        purchaseDate,
        price,
        { from: sellerA }
      );  

      // Verify that the WarrantyCreated event was emitted
      const logs = result.logs;
      const warrantyCreatedLog = logs.find(log => log.event === 'WarrantyCreated');
      const tokenIdBNObject = warrantyCreatedLog.args[0];
      const tokenId = tokenIdBNObject.words[0].toString(16);
      //console.log('tokenId :', tokenId);
    
      await expectEvent(result, "WarrantyCreated", {
        tokenId: tokenId,
        gtin:  codeGTIN,
        owner: sellerA,
      });
      
      const uint256NFTsArray = await guarantifyNFTContractInstance.getAllNFTForASeller(sellerA);
      expect(uint256NFTsArray.length).to.equal(1);

      // Convert uint256 array to BN array
      //const bnArray = uint256NFTsArray.map(x => new BN(x));
      const tokenIdNFT = uint256NFTsArray[0].words[0].toString(16);

      const warranty = await guarantifyNFTContractInstance.warrantyDetails(tokenIdNFT);

      // Calcul du hash
      const verifyHash = await guarantifyNFTContractInstance.getVerifyHash(codeGTIN, invoiceNumber);

      const bytes32CodeGTIN = ethers.utils.formatBytes32String(codeGTIN)

      expect(warranty.verifyHash).to.equal(verifyHash);
      expect(warranty.status).to.be.bignumber.equal(new BN(0));//pending
      expect(warranty.codeGTIN).to.equal(bytes32CodeGTIN);
      expect(warranty.invoiceNumber).to.bignumber.equal(invoiceNumber);
      expect(warranty.productType).to.equal(productType);
      expect(warranty.warrantyDuration).to.bignumber.equal(warrantyDuration);
      expect(warranty.purchaseDate).to.bignumber.equal(purchaseDate);
      expect(warranty.seller).to.equal(sellerA);
      expect(warranty.buyer).to.equal("0x0000000000000000000000000000000000000000");
      expect(warranty.price).to.bignumber.equal(price);
      expect(warranty.resalePrice).to.bignumber.equal("0");
  });
  
    it("should throw an error if non-authorized seller tries to create a new warranty", async () => {
      const codeGTIN = "0x456";
      const invoiceNumber = 12345;
      const productType = "Product Type";
      const warrantyDuration = 365;
      const purchaseDate = Date.now();
      const price = 100;
  
      //try {
      await expectRevert(guarantifyNFTContractInstance.createWarranty(
          codeGTIN,
          invoiceNumber,
          productType,
          warrantyDuration,
          purchaseDate,
          price,
          { from: consumerA }
        ), 'VM Exception while processing transaction: revert Only sellers can create warranties -- Reason given: Only sellers can create warranties.');
 
    });

  }); 


  describe('As ..., I should get tokenURI', () => {

    beforeEach(async () => {
      guarantifyNFTContractInstance = await GuarantifyNFTContract.new();
    });

    it("should return correct token URI for a given token ID", async () => {

      const codeGTIN = "4556545698745";
      const invoiceNumber = new BN("12345");
      const productType = "Product Type";
      const warrantyDuration = new BN("365");
      const purchaseDate = new BN(Date.now());
      const price = new BN("100");

      // Call the addSeller function
      await guarantifyNFTContractInstance.addSeller(sellerA, { from: sellerA });

      // Verify that the seller was added
      const isSeller = await guarantifyNFTContractInstance.isSeller(sellerA);
      expect(isSeller).to.equal(true);

      const result = await guarantifyNFTContractInstance.createWarranty(
        codeGTIN,
        invoiceNumber,
        productType,
        warrantyDuration,
        purchaseDate,
        price,
        { from: sellerA }
      );  
       // Verify that the WarrantyCreated event was emitted
       const logs = result.logs;
       const warrantyCreatedLog = logs.find(log => log.event === 'WarrantyCreated');
       const tokenIdBNObject = warrantyCreatedLog.args[0];
       const tokenId = tokenIdBNObject.words[0].toString(16);

      
      const expectedURI = "https://ipfs.io/ipfs/0";

      const tokenURI = await guarantifyNFTContractInstance.tokenURI(tokenId);

      expect(tokenURI).to.equal(expectedURI);
    });

    it("should return correct token URI for a given token ID", async () => {
      const tokenId = 1;
      const expectedURI = "https://guarantify.com/token/1";

      await expectRevert(guarantifyNFTContractInstance.tokenURI(tokenId), 'VM Exception while processing transaction: revert ERC721Metadata: URI query for nonexistent token');
    });

  });

  describe('As ..., I should verifyOwnership', () => {

    beforeEach(async () => {
      guarantifyNFTContractInstance = await GuarantifyNFTContract.new();
    });

    it("should verify ownership of a given token ID for a given address", async () => {

        const codeGTIN = "4556545698745";
        const invoiceNumber = new BN("12345");
        const productType = "Product Type";
        const warrantyDuration = new BN("365");
        const purchaseDate = new BN(Date.now());
        const price = new BN("100");

        // Call the addSeller function
        await guarantifyNFTContractInstance.addSeller(sellerA, { from: sellerA });

        // Verify that the seller was added
        await guarantifyNFTContractInstance.isSeller(sellerA);

        const result = await guarantifyNFTContractInstance.createWarranty(
          codeGTIN,
          invoiceNumber,
          productType,
          warrantyDuration,
          purchaseDate,
          price,
          { from: sellerA }
        );  
        // Verify that the WarrantyCreated event was emitted
        const logs = result.logs;
        const warrantyCreatedLog = logs.find(log => log.event === 'WarrantyCreated');
        const tokenIdBNObject = warrantyCreatedLog.args[0];
        const tokenId = tokenIdBNObject.words[0].toString(16);

        //const isOwner = await guarantifyNFTContractInstance.verifyOwnership(tokenId, codeGTIN, invoiceNumber, { from: sellerA });
      const receipt = await guarantifyNFTContractInstance.verifyOwnership(tokenId, codeGTIN, invoiceNumber, { from: sellerA });
      
      const resEvent = await expectEvent(receipt, "WarrantyVerified", {
        tokenId: tokenId,
        owner: sellerA,
      });

      expect( resEvent.args.owner).to.equal(sellerA);
        
    });    

    it("should verify ownership of a given token ID for a given address", async () => {

      const codeGTIN = "4556545698745";
      const invoiceNumber = new BN("12345");
      const productType = "Product Type";
      const warrantyDuration = new BN("365");
      const purchaseDate = new BN(Date.now());
      const price = new BN("100");

      // Call the addSeller function
      await guarantifyNFTContractInstance.addSeller(sellerA, { from: sellerA });
      await guarantifyNFTContractInstance.addSeller(sellerB, { from: sellerB });

      const result = await guarantifyNFTContractInstance.createWarranty(
        codeGTIN,
        invoiceNumber,
        productType,
        warrantyDuration,
        purchaseDate,
        price,
        { from: sellerB }
      );  
      // Verify that the WarrantyCreated event was emitted
      const logs = result.logs;
      const warrantyCreatedLog = logs.find(log => log.event === 'WarrantyCreated');
      const tokenIdBNObject = warrantyCreatedLog.args[0];
      const tokenId = tokenIdBNObject.words[0].toString(16);

      await expectRevert(guarantifyNFTContractInstance.verifyOwnership(tokenId, codeGTIN, invoiceNumber, { from: sellerA }), 'VM Exception while processing transaction: revert ERC721: transfer caller is not owner nor approved -- Reason given: ERC721: transfer caller is not owner nor approved.');
    });
  });

});
//contractInstance = await GuarantifyNFTContract.new({ from: sellerA }, "GuarantifyNFT", "GNFT");



        
  //const unregisteredVoter = accounts[3];
  /*
    describe('Contract ownership', () => {
      beforeEach(async () => {
        contractInstance = await GuarantifyNFTContract.new({ from: sellerA }, "name", "symbol");
      });
  
      it('Ownership has been transferred', async function () {
        expect(await contractInstance.owner()).to.equal(sellerA);
      });
    });*/

/*

const GuarantifyNFTContract = artifacts.require("GuarantifyNFTContract");

contract("GuarantifyNFTContract", (accounts) => {
  const sellerAccount = accounts[0];
  let warrantyContract;

  before(async () => {
    guarantifyNFTContract = await GuarantifyNFTContract.deployed();
  });

  it("should create a new warranty", async () => {
    const warrantyId = await guarantifyNFTContract.createWarranty(
      "verifyHash",
      "codeGTIN",
      1234,
      "productType",
      1,
      1648000000,
      { from: sellerAccount }
    );

    assert.equal(warrantyId.toNumber(), 0);
  });
});
*/