const GuarantifyNFTContract = artifacts.require("GuarantifyNFTContract");

module.exports = function (deployer) {
  deployer.deploy(GuarantifyNFTContract);
};
