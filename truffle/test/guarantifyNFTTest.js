const GuarantifyNFTContract = artifacts.require("GuarantifyNFTContract");
const ethers = require('ethers');
const { BN, expectRevert, expectEvent, web3, getBlockTimestamp } = require('@openzeppelin/test-helpers');

const { expect } = require('chai');

contract("GuarantifyNFTContract", (accounts) => {
  let guarantifyNFTContractInstance;
  const sellerA = accounts[0];
  const consumerA = accounts[1];
  const consumerB = accounts[2];
  const sellerB = accounts[3];

  describe('As user of Dapp, I should be able to add or delete my seller account', () => {

    beforeEach(async () => {
      guarantifyNFTContractInstance = await GuarantifyNFTContract.new();
    });

    it("should add a seller", async () => {
      // Call the addSeller function
      await guarantifyNFTContractInstance.addSeller(sellerA, { from: sellerA });

      // Verify that the seller was added
      const isSeller = await guarantifyNFTContractInstance.isSeller(sellerA);
      expect(isSeller).to.equal(true);
    });


    it('Should return an error when seller wants add an another seller', async function () {
      // Add the seller
      await expectRevert(guarantifyNFTContractInstance.addSeller(sellerA, { from: sellerB }), 'Only the owner of the account can add it');

      // Verify that the seller was added
      const isSeller = await guarantifyNFTContractInstance.isSeller(sellerA);
      expect(isSeller).to.equal(false);
    });

    it('Should return an error when seller already add', async function () {
      // Call the addSeller function
      await guarantifyNFTContractInstance.addSeller(sellerA, { from: sellerA });
      // Add the seller
      await expectRevert(guarantifyNFTContractInstance.addSeller(sellerA, { from: sellerA }), 'VM Exception while processing transaction: revert Seller already added -- Reason given: Seller already added.');

      // Verify that the seller was added
      const isSeller = await guarantifyNFTContractInstance.isSeller(sellerA);
      expect(isSeller).to.equal(true);
    });

    it("should remove a seller", async () => {
      // Add the seller
      await guarantifyNFTContractInstance.addSeller(sellerA, { from: sellerA });

      // Call the removeSeller function
      await guarantifyNFTContractInstance.removeSeller(sellerA, { from: sellerA });

      const testAfter = await guarantifyNFTContractInstance.mSellersByAddress(sellerA, { from: sellerA });
      expect(testAfter.sellerAddress).to.equal('0x0000000000000000000000000000000000000000');

      // Verify that the seller was removed
      const isSeller = await guarantifyNFTContractInstance.isSeller(sellerA);
      expect(isSeller).to.equal(false);
    });

    it('Should return an error when seller wants remove an another seller', async function () {
      // Add the seller
      await guarantifyNFTContractInstance.addSeller(sellerA, { from: sellerA });

      // Call the removeSeller function
      await expectRevert(guarantifyNFTContractInstance.removeSeller(sellerA, { from: sellerB }), 'Only the owner of the account can delete it');

      // Verify that the seller was added
      const isSeller = await guarantifyNFTContractInstance.isSeller(sellerA);
      expect(isSeller).to.equal(true);
    });

  });


  describe('As user of Dapp, I should be able to add or delete my Consumer account', () => {

    beforeEach(async () => {
      guarantifyNFTguarantifyNFTContractInstance = await GuarantifyNFTContract.new();
    });

    // Tester la fonction addConsumer
    it("devrait ajouter un consommateur", async () => {
      await guarantifyNFTguarantifyNFTContractInstance.addConsumer(consumerA, { from: consumerA });
      const isConsumer = await guarantifyNFTguarantifyNFTContractInstance.isConsumer(consumerA);
      expect(isConsumer).to.equal(true);
    });

    it('Should return an error when a Consumer wants add an another Consumer', async function () {
      // Add the seller
      await expectRevert(guarantifyNFTguarantifyNFTContractInstance.addConsumer(consumerA, { from: consumerB }), 'Only the owner of the account can add it');

      // Verify that the seller was added
      const isConsumer = await guarantifyNFTguarantifyNFTContractInstance.isConsumer(consumerA);
      expect(isConsumer).to.equal(false);
    });

    it('Should return an error when Consumer already add', async function () {
      // Call the addConsumer function
      await guarantifyNFTguarantifyNFTContractInstance.addConsumer(consumerA, { from: consumerA });

      // Add the seller
      await expectRevert(guarantifyNFTguarantifyNFTContractInstance.addConsumer(consumerA, { from: consumerA }), 'VM Exception while processing transaction: revert Consumer already added -- Reason given: Consumer already added.');

      // Verify that the seller was added
      const isConsumer = await guarantifyNFTguarantifyNFTContractInstance.isConsumer(consumerA);
      expect(isConsumer).to.equal(true);
    });

    // Tester la fonction removeConsumer
    it("devrait supprimer un consommateur", async () => {
      await guarantifyNFTguarantifyNFTContractInstance.addConsumer(consumerA, { from: consumerA });
      await guarantifyNFTguarantifyNFTContractInstance.removeConsumer(consumerA, { from: consumerA });

      const testAfter = await guarantifyNFTguarantifyNFTContractInstance.mConsumersByAddress(consumerA, { from: consumerA });
      expect(testAfter.ConsumerAddress).to.equal('0x0000000000000000000000000000000000000000');

      const isConsumer = await guarantifyNFTguarantifyNFTContractInstance.isConsumer(consumerA);
      expect(isConsumer).to.equal(false);
    });

    it('Should return an error when a Consumer wants remove an another Consumer', async function () {
      // Add the consuler
      await guarantifyNFTguarantifyNFTContractInstance.addConsumer(consumerA, { from: consumerA });

      // Call the removeConsumer function
      await expectRevert(guarantifyNFTguarantifyNFTContractInstance.removeConsumer(consumerA, { from: consumerB }), 'Only the owner of the account can delete it');

      // Verify that the seller was added
      const isConsumer = await guarantifyNFTguarantifyNFTContractInstance.isConsumer(consumerA);
      expect(isConsumer).to.equal(true);
    });
  });

  describe('As a seller, I should be able to create a NFT', () => {

    beforeEach(async () => {
      guarantifyNFTguarantifyNFTContractInstance = await GuarantifyNFTContract.new();
    });

    it("should create a new warranty with valid details", async () => {
      const codeGTIN = "4556545698745";
      const invoiceNumber = new BN("12345");
      const productType = "Product Type";
      const warrantyDurationInDay = new BN("365");
      const price = new BN("100");

      // Call the addSeller function
      await guarantifyNFTguarantifyNFTContractInstance.addSeller(sellerA, { from: sellerA });

      // Verify that the seller was added
      const isSeller = await guarantifyNFTguarantifyNFTContractInstance.isSeller(sellerA);
      expect(isSeller).to.equal(true);

      const result = await guarantifyNFTguarantifyNFTContractInstance.createWarranty(
        codeGTIN,
        invoiceNumber,
        productType,
        warrantyDurationInDay,
        price,
        { from: sellerA }
      );

      // Verify that the WarrantyCreated event was emitted
      const logs = result.logs;
      const warrantyCreatedLog = logs.find(log => log.event === 'eventWarrantyTokenIsCreated');
      const tokenIdBNObject = warrantyCreatedLog.args[0];
      const tokenId = tokenIdBNObject.words[0].toString(16);
      //console.log('tokenId :', tokenId);

      await expectEvent(result, "eventWarrantyTokenIsCreated", {
        tokenId: tokenId,
        gtin: codeGTIN,
        owner: sellerA,
      });

      const uint256NFTsArray = await guarantifyNFTguarantifyNFTContractInstance.getAllNFTForASeller(sellerA);
      expect(uint256NFTsArray.length).to.equal(1);

      // Convert uint256 array to BN array
      //const bnArray = uint256NFTsArray.map(x => new BN(x));
      const tokenIdNFT = uint256NFTsArray[0].words[0].toString(16);

      const warranty = await guarantifyNFTguarantifyNFTContractInstance.mWarrantyTokenById(tokenIdNFT);

      // Calcul du hash
      const verifyHash = await guarantifyNFTguarantifyNFTContractInstance.getVerifyHash(codeGTIN, invoiceNumber);

      const bytes32CodeGTIN = ethers.utils.formatBytes32String(codeGTIN)


      expect(warranty.verifyHash).to.equal(verifyHash);
      expect(warranty.status).to.be.bignumber.equal(new BN(0));//pending
      expect(warranty.codeGTIN).to.equal(bytes32CodeGTIN);
      expect(warranty.invoiceNumber).to.bignumber.equal(invoiceNumber);
      expect(warranty.productType).to.equal(productType);
      expect(warranty.warrantyDurationInDay).to.bignumber.equal(warrantyDurationInDay);
      const purchaseDate = new BN(Date.now() / 1000);
      const purchaseDateOneMinuteAgo = new BN((Date.now() - 60000) / 1000);
      //      expect(warranty.purchaseDate).to.bignumber.equal(purchaseDate);
      expect(warranty.purchaseDate).to.be.bignumber.that.is.at.least(purchaseDateOneMinuteAgo);//vérifie que purchaseDate est supérieure ou égale à 1 min
      expect(warranty.purchaseDate).to.be.bignumber.that.is.at.most(purchaseDate);//vérifie que purchaseDate est inférieure ou égale à maintenant.
      expect(warranty.sellerAddress).to.equal(sellerA);
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
      await expectRevert(guarantifyNFTguarantifyNFTContractInstance.createWarranty(
        codeGTIN,
        invoiceNumber,
        productType,
        warrantyDuration,
        price,
        { from: consumerA }
      ), 'VM Exception while processing transaction: revert Only Sellers can create warranties -- Reason given: Only Sellers can create warranties.');

    });

  });


  describe('As ..., I should get tokenURI', () => {

    beforeEach(async () => {
      guarantifyNFTguarantifyNFTContractInstance = await GuarantifyNFTContract.new();
    });

    it("should return correct token URI for a given token ID", async () => {

      const codeGTIN = "4556545698745";
      const invoiceNumber = new BN("12345");
      const productType = "Product Type";
      const warrantyDuration = new BN("365");
      const purchaseDate = new BN(Date.now());
      const price = new BN("100");

      // Call the addSeller function
      await guarantifyNFTguarantifyNFTContractInstance.addSeller(sellerA, { from: sellerA });

      // Verify that the seller was added
      const isSeller = await guarantifyNFTguarantifyNFTContractInstance.isSeller(sellerA);
      expect(isSeller).to.equal(true);

      const result = await guarantifyNFTguarantifyNFTContractInstance.createWarranty(
        codeGTIN,
        invoiceNumber,
        productType,
        warrantyDuration,
        price,
        { from: sellerA }
      );
      // Verify that the WarrantyCreated event was emitted
      const logs = result.logs;
      const warrantyCreatedLog = logs.find(log => log.event === 'eventWarrantyTokenIsCreated');
      const tokenIdBNObject = warrantyCreatedLog.args[0];
      const tokenId = tokenIdBNObject.words[0].toString(16);


      const expectedURI = "https://ipfs.io/ipfs/0";

      const tokenURI = await guarantifyNFTguarantifyNFTContractInstance.tokenURI(tokenId);

      expect(tokenURI).to.equal(expectedURI);
    });

    it("should return correct token URI for a given token ID", async () => {
      const tokenId = 1;
      const expectedURI = "https://guarantify.com/token/1";

      await expectRevert(guarantifyNFTguarantifyNFTContractInstance.tokenURI(tokenId), 'VM Exception while processing transaction: revert ERC721Metadata: URI query for nonexistent token');
    });

  });

  describe('As ..., I should verifyOwnershipByHash', () => {

    beforeEach(async () => {
      guarantifyNFTguarantifyNFTContractInstance = await GuarantifyNFTContract.new();
    });

    it("should verify ownership of a given token ID for a given address", async () => {

      const codeGTIN = "4556545698745";
      const invoiceNumber = new BN("12345");
      const productType = "Product Type";
      const warrantyDuration = new BN("365");
      const purchaseDate = new BN(Date.now());
      const price = new BN("100");

      // Call the addSeller function
      await guarantifyNFTguarantifyNFTContractInstance.addSeller(sellerA, { from: sellerA });

      // Verify that the seller was added
      await guarantifyNFTguarantifyNFTContractInstance.isSeller(sellerA);

      const result = await guarantifyNFTguarantifyNFTContractInstance.createWarranty(
        codeGTIN,
        invoiceNumber,
        productType,
        warrantyDuration,
        price,
        { from: sellerA }
      );
      // Verify that the WarrantyCreated event was emitted
      const logs = result.logs;
      const warrantyCreatedLog = logs.find(log => log.event === 'eventWarrantyTokenIsCreated');
      const tokenIdBNObject = warrantyCreatedLog.args[0];
      const tokenId = tokenIdBNObject.words[0].toString(16);

      //const isOwner = await guarantifyNFTguarantifyNFTContractInstance.verifyOwnershipByHash(tokenId, codeGTIN, invoiceNumber, { from: sellerA });
      const receipt = await guarantifyNFTguarantifyNFTContractInstance.verifyOwnershipByHash(tokenId, codeGTIN, invoiceNumber, { from: sellerA });

      const resEvent = await expectEvent(receipt, "eventWarrantyTokenIsVerified", {
        tokenId: tokenId,
        owner: sellerA,
      });

      expect(resEvent.args.owner).to.equal(sellerA);

    });

    it("should verify ownership of a given token ID for a given address", async () => {

      const codeGTIN = "4556545698745";
      const invoiceNumber = new BN("12345");
      const productType = "Product Type";
      const warrantyDuration = new BN("365");
      const purchaseDate = new BN(Date.now());
      const price = new BN("100");

      // Call the addSeller function
      await guarantifyNFTguarantifyNFTContractInstance.addSeller(sellerA, { from: sellerA });
      await guarantifyNFTguarantifyNFTContractInstance.addSeller(sellerB, { from: sellerB });

      const result = await guarantifyNFTguarantifyNFTContractInstance.createWarranty(
        codeGTIN,
        invoiceNumber,
        productType,
        warrantyDuration,
        price,
        { from: sellerB }
      );
      // Verify that the WarrantyCreated event was emitted
      const logs = result.logs;
      const warrantyCreatedLog = logs.find(log => log.event === 'eventWarrantyTokenIsCreated');
      const tokenIdBNObject = warrantyCreatedLog.args[0];
      const tokenId = tokenIdBNObject.words[0].toString(16);

      await expectRevert(guarantifyNFTguarantifyNFTContractInstance.verifyOwnershipByHash(tokenId, codeGTIN, invoiceNumber, { from: sellerA }), 'VM Exception while processing transaction: revert ERC721: transfer caller is not owner nor approved -- Reason given: ERC721: transfer caller is not owner nor approved.');
    });
  });



  describe('As a Consumer , I should claim And Enabled Warranty', () => {

    beforeEach(async () => {
      guarantifyNFTguarantifyNFTContractInstance = await GuarantifyNFTContract.new();
    });

    it('should claim and enable warranty', async () => {

      const codeGTIN = "4556545698745";
      const invoiceNumber = new BN("12345");
      const productType = "Product Type";
      const warrantyDuration = new BN("365");
      const purchaseDate = new BN(Date.now());
      const price = new BN("100");

      // Call the addSeller function
      await guarantifyNFTguarantifyNFTContractInstance.addSeller(sellerA, { from: sellerA });

      const result = await guarantifyNFTguarantifyNFTContractInstance.createWarranty(
        codeGTIN,
        invoiceNumber,
        productType,
        warrantyDuration,
        price,
        { from: sellerA }
      );

      // Verify that the WarrantyCreated event was emitted
      const logs = result.logs;
      const warrantyCreatedLog = logs.find(log => log.event === 'eventWarrantyTokenIsCreated');
      const tokenIdBNObject = warrantyCreatedLog.args[0];
      const tokenId = tokenIdBNObject.words[0].toString(16);

      // Call the addSeller function
      await guarantifyNFTguarantifyNFTContractInstance.addConsumer(consumerA, { from: consumerA });

      // Claim and enable the warranty
      const isVerifyHash = await guarantifyNFTguarantifyNFTContractInstance.isVerifyHash(codeGTIN, invoiceNumber, tokenId);
      expect(isVerifyHash).to.be.true;

      const tx = await guarantifyNFTguarantifyNFTContractInstance.claimAndEnabledWarranty(tokenId, codeGTIN, invoiceNumber, { from: consumerA });

      // Check that the WarrantyClaimedAndEnabled event was emitted
      const resEvent = await expectEvent(tx, "eventWarrantyTokenIsEnabled", {
        tokenId: tokenId,
        owner: consumerA,
      });

      expect(resEvent.args.owner).to.equal(consumerA);

      await expectRevert(guarantifyNFTguarantifyNFTContractInstance.verifyOwnershipByHash(tokenId, codeGTIN, invoiceNumber, { from: sellerA }), 'VM Exception while processing transaction: revert ERC721: transfer caller is not owner nor approved -- Reason given: ERC721: transfer caller is not owner nor approved.');
    });

    it('should revert when claiming warranty for hash no verify', async () => {

      const codeGTIN = "4556545698745";
      const invoiceNumber = new BN("12345");
      const productType = "Product Type";
      const warrantyDuration = new BN("365");
      const purchaseDate = new BN(Date.now());
      const price = new BN("100");

      // Call the addSeller function
      await guarantifyNFTguarantifyNFTContractInstance.addSeller(sellerA, { from: sellerA });

      const result = await guarantifyNFTguarantifyNFTContractInstance.createWarranty(
        codeGTIN,
        invoiceNumber,
        productType,
        warrantyDuration,
        price,
        { from: sellerA }
      );

      // Verify that the WarrantyCreated event was emitted
      const logs = result.logs;
      const warrantyCreatedLog = logs.find(log => log.event === 'eventWarrantyTokenIsCreated');
      const tokenIdBNObject = warrantyCreatedLog.args[0];
      const tokenId = tokenIdBNObject.words[0].toString(16);

      // Call the addSeller function
      await guarantifyNFTguarantifyNFTContractInstance.addConsumer(consumerA, { from: consumerA });

      const isVerifyHash = await guarantifyNFTguarantifyNFTContractInstance.isVerifyHash("4556545698744", invoiceNumber, tokenId);
      expect(isVerifyHash).to.be.false;
      await expectRevert(guarantifyNFTguarantifyNFTContractInstance.claimAndEnabledWarranty(tokenId, "4556545698744", invoiceNumber, { from: consumerA }), 'VM Exception while processing transaction: revert WarrantyContract: hash not verify -- Reason given: WarrantyContract: hash not verify.');
      await expectRevert(guarantifyNFTguarantifyNFTContractInstance.verifyOwnershipByHash(tokenId, codeGTIN, invoiceNumber, { from: consumerA }), 'VM Exception while processing transaction: revert ERC721: transfer caller is not owner nor approved -- Reason given: ERC721: transfer caller is not owner nor approved.');


    });

    it('should revert when claiming warranty for non-existent token', async () => {
      const nonExistentTokenId = new BN(999);
      const codeGTIN = "4556545698745";
      const invoiceNumber = new BN("12345");

      await guarantifyNFTguarantifyNFTContractInstance.addConsumer(consumerA, { from: consumerA });

      await expectRevert(
        guarantifyNFTguarantifyNFTContractInstance.claimAndEnabledWarranty(nonExistentTokenId, codeGTIN, invoiceNumber, { from: consumerA }), 'VM Exception while processing transaction: revert WarrantyContract: token does not exist -- Reason given: WarrantyContract: token does not exist.'
      );
    });

  });


  describe('As a Consumer , I should to sell my Warranty to another Consumer', () => {

    beforeEach(async () => {
      guarantifyNFTguarantifyNFTContractInstance = await GuarantifyNFTContract.new();
    });

    it('should sell my Warranty', async () => {

      const codeGTIN = "4556545698745";
      const invoiceNumber = new BN("12345");
      const productType = "Product Type";
      const warrantyDuration = new BN("365");
      const purchaseDate = new BN(Date.now());
      const price = new BN("100");
      const resalePrice = new BN("50");

      // Call the addSeller function
      await guarantifyNFTguarantifyNFTContractInstance.addSeller(sellerA, { from: sellerA });

      const result = await guarantifyNFTguarantifyNFTContractInstance.createWarranty(
        codeGTIN,
        invoiceNumber,
        productType,
        warrantyDuration,
        price,
        { from: sellerA }
      );

      // Verify that the WarrantyCreated event was emitted
      const logs = result.logs;
      const warrantyCreatedLog = logs.find(log => log.event === 'eventWarrantyTokenIsCreated');
      const tokenIdBNObject = warrantyCreatedLog.args[0];
      const tokenId = tokenIdBNObject.words[0].toString(16);

      // Call the addSeller function
      await guarantifyNFTguarantifyNFTContractInstance.addConsumer(consumerA, { from: consumerA });

      // Claim and enable the warranty
      const tx = await guarantifyNFTguarantifyNFTContractInstance.claimAndEnabledWarranty(tokenId, codeGTIN, invoiceNumber, { from: consumerA });

      // Check that the WarrantyClaimedAndEnabled event was emitted
      const resEvent = await expectEvent(tx, "eventWarrantyTokenIsEnabled", {
        tokenId: tokenId,
        owner: consumerA,
      });

      expect(resEvent.args.owner).to.equal(consumerA);

      await expectRevert(guarantifyNFTguarantifyNFTContractInstance.verifyOwnershipByHash(tokenId, codeGTIN, invoiceNumber, { from: sellerA }), 'VM Exception while processing transaction: revert ERC721: transfer caller is not owner nor approved -- Reason given: ERC721: transfer caller is not owner nor approved.');

      await guarantifyNFTguarantifyNFTContractInstance.addConsumer(consumerB, { from: consumerB });

      const txResell = await guarantifyNFTguarantifyNFTContractInstance.resell(consumerB, tokenId, resalePrice, { from: consumerA });

      // Check that the WarrantyClaimedAndEnabled event was emitted
      const resEventResell = await expectEvent(txResell, "eventWarrantyTokenIsTransfered", {
        tokenId: tokenId,
        owner: consumerA,
        resalePrice: resalePrice,
        to: consumerB
      });

      expect(resEventResell.args.owner).to.equal(consumerA);
      expect(resEventResell.args.to).to.equal(consumerB);
      await expectRevert(guarantifyNFTguarantifyNFTContractInstance.verifyOwnershipByHash(tokenId, codeGTIN, invoiceNumber, { from: consumerA }), 'VM Exception while processing transaction: revert ERC721: transfer caller is not owner nor approved -- Reason given: ERC721: transfer caller is not owner nor approved.');

    });

    it('should revert when sell a Warranty that is not mine', async () => {

      const codeGTIN = "4556545698745";
      const invoiceNumber = new BN("12345");
      const productType = "Product Type";
      const warrantyDuration = new BN("365");
      const purchaseDate = new BN(Date.now());
      const price = new BN("100");
      const resalePrice = new BN("50");

      // Call the addSeller function
      await guarantifyNFTguarantifyNFTContractInstance.addSeller(sellerA, { from: sellerA });

      const result = await guarantifyNFTguarantifyNFTContractInstance.createWarranty(
        codeGTIN,
        invoiceNumber,
        productType,
        warrantyDuration,
        price,
        { from: sellerA }
      );

      // Verify that the WarrantyCreated event was emitted
      const logs = result.logs;
      const warrantyCreatedLog = logs.find(log => log.event === 'eventWarrantyTokenIsCreated');
      const tokenIdBNObject = warrantyCreatedLog.args[0];
      const tokenId = tokenIdBNObject.words[0].toString(16);

      // Call the addSeller function
      await guarantifyNFTguarantifyNFTContractInstance.addConsumer(consumerA, { from: consumerA });

      // Claim and enable the warranty
      const tx = await guarantifyNFTguarantifyNFTContractInstance.claimAndEnabledWarranty(tokenId, codeGTIN, invoiceNumber, { from: consumerA });

      // Check that the WarrantyClaimedAndEnabled event was emitted
      const resEvent = await expectEvent(tx, "eventWarrantyTokenIsEnabled", {
        tokenId: tokenId,
        owner: consumerA,
      });

      expect(resEvent.args.owner).to.equal(consumerA);

      await expectRevert(guarantifyNFTguarantifyNFTContractInstance.verifyOwnershipByHash(tokenId, codeGTIN, invoiceNumber, { from: sellerA }), 'VM Exception while processing transaction: revert ERC721: transfer caller is not owner nor approved -- Reason given: ERC721: transfer caller is not owner nor approved.');

      await guarantifyNFTguarantifyNFTContractInstance.addConsumer(consumerB, { from: consumerB });

      await expectRevert(guarantifyNFTguarantifyNFTContractInstance.resell(consumerA, tokenId, resalePrice, { from: consumerB }), 'VM Exception while processing transaction: revert Not Owner of this NFT warranty -- Reason given: Not Owner of this NFT warranty');

    });

    it('should revert when sell a Warranty not enabled', async () => {

      const codeGTIN = "4556545698745";
      const invoiceNumber = new BN("12345");
      const productType = "Product Type";
      const warrantyDuration = new BN("365");
      const purchaseDate = new BN(Date.now());
      const price = new BN("100");
      const resalePrice = new BN("50");

      // Call the addSeller function
      await guarantifyNFTguarantifyNFTContractInstance.addSeller(sellerA, { from: sellerA });

      const result = await guarantifyNFTguarantifyNFTContractInstance.createWarranty(
        codeGTIN,
        invoiceNumber,
        productType,
        warrantyDuration,
        price,
        { from: sellerA }
      );

      // Verify that the WarrantyCreated event was emitted
      const logs = result.logs;
      const warrantyCreatedLog = logs.find(log => log.event === 'eventWarrantyTokenIsCreated');
      const tokenIdBNObject = warrantyCreatedLog.args[0];
      const tokenId = tokenIdBNObject.words[0].toString(16);

      // Call the addSeller function
      await guarantifyNFTguarantifyNFTContractInstance.addConsumer(consumerA, { from: consumerA });
      const guarantifyContractAddress = await guarantifyNFTguarantifyNFTContractInstance.guarantifyContractAddress();

      await expectRevert(guarantifyNFTguarantifyNFTContractInstance.resell(consumerA, tokenId, resalePrice, { from: guarantifyContractAddress }), 'This warranty is not enabled');

    });


    it('should revert when sell a Warranty not existed', async () => {

      const resalePrice = new BN("50");


      // Call the addSeller function
      await guarantifyNFTguarantifyNFTContractInstance.addConsumer(consumerA, { from: consumerA });
      await guarantifyNFTguarantifyNFTContractInstance.addConsumer(consumerB, { from: consumerB });

      await expectRevert(guarantifyNFTguarantifyNFTContractInstance.resell(consumerB, new BN(13245646), resalePrice, { from: consumerA }), 'VM Exception while processing transaction: revert ERC721Metadata: nonexistent token -- Reason given: ERC721Metadata: nonexistent token.');

    });

  });



  describe('As a smart contract, I should burn a NFTG when the time is expired', () => {

    beforeEach(async () => {
      guarantifyNFTguarantifyNFTContractInstance = await GuarantifyNFTContract.new();
    });

    it("should burn a token with expired warranty", async () => {
      const codeGTIN = "4556545698745";
      const invoiceNumber0 = new BN("12346");
      const invoiceNumber1 = new BN("12347");
      const invoiceNumber = new BN("12345");
      const productType = "Product Type";
      const warrantyDurationInDay = new BN("0");
      const price = new BN("100");

      // Call the addSeller function
      await guarantifyNFTguarantifyNFTContractInstance.addSeller(sellerA, { from: sellerA });

      await guarantifyNFTguarantifyNFTContractInstance.createWarranty(
        codeGTIN,
        invoiceNumber0,
        productType,
        warrantyDurationInDay,
        price,
        { from: sellerA }
      );
      const result = await guarantifyNFTguarantifyNFTContractInstance.createWarranty(
        codeGTIN,
        invoiceNumber,
        productType,
        warrantyDurationInDay,
        price,
        { from: sellerA }
      );
      await guarantifyNFTguarantifyNFTContractInstance.createWarranty(
        codeGTIN,
        invoiceNumber1,
        productType,
        warrantyDurationInDay,
        price,
        { from: sellerA }
      );
      // Verify that the WarrantyCreated event was emitted
      const logs = result.logs;
      const warrantyCreatedLog = logs.find(log => log.event === 'eventWarrantyTokenIsCreated');
      const tokenIdBNObject = warrantyCreatedLog.args[0];
      const tokenId = tokenIdBNObject.words[0].toString(16);

      const resultAllNFTsForSale = await guarantifyNFTguarantifyNFTContractInstance.getAllNFTOnSaleForASeller(sellerA);
      expect(resultAllNFTsForSale).to.be.an('array');
      expect(resultAllNFTsForSale).to.have.lengthOf(0);

      //expect(resultAllNFTs).to.have.members(tokenId);

      let warranty = await guarantifyNFTguarantifyNFTContractInstance.mWarrantyTokenById(tokenId);
      expect(warranty.status).to.be.bignumber.equal(new BN(0)); // WarrantyTokenStatus.Pending

      // Call the addSeller function
      await guarantifyNFTguarantifyNFTContractInstance.addConsumer(consumerA, { from: consumerA });

      // Claim and enable the warranty
      const tx = await guarantifyNFTguarantifyNFTContractInstance.claimAndEnabledWarranty(tokenId, codeGTIN, invoiceNumber, { from: consumerA });

      // Check that the WarrantyClaimedAndEnabled event was emitted
      const resEvent = await expectEvent(tx, "eventWarrantyTokenIsEnabled", {
        tokenId: tokenId,
        owner: consumerA,
      });

      expect(resEvent.args.owner).to.equal(consumerA);

      await expectRevert(guarantifyNFTguarantifyNFTContractInstance.verifyOwnershipByHash(tokenId, codeGTIN, invoiceNumber, { from: sellerA }), 'VM Exception while processing transaction: revert ERC721: transfer caller is not owner nor approved -- Reason given: ERC721: transfer caller is not owner nor approved.');

      warranty = await guarantifyNFTguarantifyNFTContractInstance.mWarrantyTokenById(tokenId);
      expect(warranty.warrantyDurationInDay).to.bignumber.equal(warrantyDurationInDay);

      //      const oneYear = 365 * 24 * 60 * 60 * 1000; // 1 an en millisecondes
      const purchaseDate = new BN(Date.now() / 1000);
      const purchaseDateOneMinuteAgo = new BN((Date.now() - 60000) / 1000);
      //console.log('difference : ' + new BN(purchaseDateOneMinuteAgo).sub(purchaseDate));
      expect(warranty.purchaseDate).to.be.bignumber.that.is.at.least(purchaseDateOneMinuteAgo);//vérifie que purchaseDate est supérieure ou égale à 1 min
      expect(warranty.purchaseDate).to.be.bignumber.that.is.at.most(purchaseDate);//vérifie que purchaseDate est inférieure ou égale à maintenant.
      expect(warranty.status).to.be.bignumber.equal(new BN(1)); // WarrantyTokenStatus.Enabled

      const txBurn = await guarantifyNFTguarantifyNFTContractInstance.burn(tokenId, { from: consumerA });
      await expectRevert(guarantifyNFTguarantifyNFTContractInstance.ownerOf(tokenId), 'VM Exception while processing transaction: revert ERC721: invalid token ID');

      // Check that the token was burned
      await expectEvent(txBurn, "eventWarrantyTokenIsExpired", { tokenId: tokenId });
      const resEventBurn = await expectEvent(txBurn, "eventWarrantyTokenIsBurned", { tokenId: tokenId });
      expect(resEventBurn.args.owner).to.equal(consumerA);

      // Check that the warranty status was updated
      warranty = await guarantifyNFTguarantifyNFTContractInstance.mWarrantyTokenById(tokenId);
      expect(warranty.status).to.be.bignumber.equal(new BN(2)); // WarrantyTokenStatus.Expired
    });

    it("should revert when burning a token with non-expired warranty", async () => {
      const codeGTIN = "4556545698745";
      const invoiceNumber = new BN("12345");
      const productType = "Product Type";
      const warrantyDuration = new BN("365");
      const purchaseDate = new BN(Date.now());
      const price = new BN("100");
      const resalePrice = new BN("50");

      // Call the addSeller function
      await guarantifyNFTguarantifyNFTContractInstance.addSeller(sellerA, { from: sellerA });

      const result = await guarantifyNFTguarantifyNFTContractInstance.createWarranty(
        codeGTIN,
        invoiceNumber,
        productType,
        warrantyDuration,
        price,
        { from: sellerA }
      );

      // Verify that the WarrantyCreated event was emitted
      const logs = result.logs;
      const warrantyCreatedLog = logs.find(log => log.event === 'eventWarrantyTokenIsCreated');
      const tokenIdBNObject = warrantyCreatedLog.args[0];
      const tokenId = tokenIdBNObject.words[0].toString(16);

      // Call the addSeller function
      await guarantifyNFTguarantifyNFTContractInstance.addConsumer(consumerA, { from: consumerA });

      // Claim and enable the warranty
      const tx = await guarantifyNFTguarantifyNFTContractInstance.claimAndEnabledWarranty(tokenId, codeGTIN, invoiceNumber, { from: consumerA });

      // Check that the WarrantyClaimedAndEnabled event was emitted
      const resEvent = await expectEvent(tx, "eventWarrantyTokenIsEnabled", {
        tokenId: tokenId,
        owner: consumerA,
      });

      expect(resEvent.args.owner).to.equal(consumerA);

      await expectRevert(guarantifyNFTguarantifyNFTContractInstance.verifyOwnershipByHash(tokenId, codeGTIN, invoiceNumber, { from: sellerA }), 'VM Exception while processing transaction: revert ERC721: transfer caller is not owner nor approved -- Reason given: ERC721: transfer caller is not owner nor approved.');

      await guarantifyNFTguarantifyNFTContractInstance.addConsumer(consumerB, { from: consumerB });

      const guarantifyContractAddress = await guarantifyNFTguarantifyNFTContractInstance.guarantifyContractAddress();
      await expectRevert(guarantifyNFTguarantifyNFTContractInstance.burn(tokenId, { from: guarantifyContractAddress }), 'VM Exception while processing transaction: revert The garantie is not expired -- Reason given: The garantie is not expired.');

    });

  });
});

