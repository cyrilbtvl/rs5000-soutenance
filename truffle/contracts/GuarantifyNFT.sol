// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract GuarantifyNFTContract is ERC721 {
    using Strings for uint256;
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIdCounter;
    Counters.Counter private _sellerIdCounter;
    Counters.Counter private _consumerIdCounter;

    //string private _baseURI;

    enum NFTStatus {
        Pending,
        Verified,
        Disabled,
        Enabled,
        Expired,
        ForSale
        //Claimed,
    }
    struct seller {
        uint256 id;
        uint256 itemCounter;
        address sellerAddress;
        uint256[] allNFTs;
        uint256[] allNFTsOnSale;
        //string tokenURI;
    }

    struct consumer {
        uint256 id;
        uint256 itemCounter;
        address consumerAddress;
        uint256[] allNFTs;
        uint256[] allNFTsOnSale;
        //string tokenURI;
    }

    struct WarrantyDetails {
        uint256 id;
        bytes32 verifyHash;
        NFTStatus status;
        bytes32 codeGTIN;
        uint256 invoiceNumber;
        string productType;
        uint256 warrantyDuration;
        uint256 purchaseDate;
        address seller;
        address buyer;
        uint256 price;
        uint256 resalePrice;
        //uint256[] buyers;
        //uint256[] buyersDate;
    }

    mapping(uint256 => WarrantyDetails) public warrantyDetails;
    mapping(address => bool) private _isSeller;
    mapping(address => uint256) public addressToSellerId;
    mapping(uint256 => seller) public allSellers;
    mapping(address => seller) public mSeller;
    mapping(uint256 => address) private _tokenSaleContracts;
    mapping(address => bool) private _isConsumer;
    mapping(address => uint256) public addressToConsumerId;
    mapping(uint256 => consumer) public allConsumers;
    mapping(address => consumer) public mConsumer;
    //mapping(uint256 => bytes32) private _tokenIdToIPFSHash;

    event WarrantyCreated(uint256 tokenId, string gtin, address owner);
    //bytes32 ipfsHash,

    event WarrantyisPending(uint256 tokenId);
    event WarrantyVerified(uint256 tokenId, address owner);
    event WarrantyDisabled(uint256 tokenId);
    event WarrantyEnabled(uint256 tokenId);
    event NFTForSale(uint256 tokenId, uint256 price, address owner);
    event NFTBurn(uint256 tokenId);

    //event WarrantyClaimed(uint256 tokenId);

    constructor() ERC721("GuarantifyNFT", "GNFT") {}

    /*constructor(
        string memory name,
        string memory symbol,
        string memory baseURI_
    ) ERC721(name, symbol) {
        // _baseURI = baseURI_;
    }*/

    modifier onlyAuthorizedSeller() {
        //require(_isSeller[msg.sender], "Only sellers can create warranties");
        //require(msg.sender == allSellers[sellerId].sellerAddress, "Must be seller");
        require(_isSeller[msg.sender], "Only sellers can create warranties");
        _;
    }

    function _baseURI() internal pure override returns (string memory) {
        return "https://ipfs.io/ipfs/";
    }

    function createWarranty(
        string memory _codeGTIN,
        uint256 _invoiceNumber,
        string memory _productType,
        uint256 _warrantyDuration,
        uint256 _purchaseDate,
        uint256 _price
    ) public onlyAuthorizedSeller returns (uint256) {
        uint256 tokenId = _tokenIdCounter.current();
        bytes32 verifyHash = getVerifyHash(_codeGTIN, _invoiceNumber); //  keccak256(abi.encode(_invoiceNumber, _codeGTIN));
        // Add the NFT metadata to the mapping
        WarrantyDetails memory newWarranty = WarrantyDetails({
            id: tokenId,
            verifyHash: verifyHash,
            status: NFTStatus.Pending,
            codeGTIN: stringToBytes32(_codeGTIN),
            invoiceNumber: _invoiceNumber,
            productType: _productType,
            warrantyDuration: _warrantyDuration,
            purchaseDate: _purchaseDate,
            seller: msg.sender,
            buyer: address(0),
            price: _price,
            resalePrice: 0
        });

        warrantyDetails[tokenId] = newWarranty;
        mSeller[msg.sender].allNFTs.push(tokenId);

        emit WarrantyCreated(tokenId, _codeGTIN, msg.sender);

        _safeMint(msg.sender, tokenId);
        _tokenIdCounter.increment();

        return tokenId;
    }

    function verifyOwnership(
        uint256 tokenId,
        string memory _codeGTIN,
        uint256 _invoiceNumber
    ) public returns (bool) {
        require(
            _isApprovedOrOwner(msg.sender, tokenId),
            "ERC721: transfer caller is not owner nor approved"
        );

        bytes32 verifyHash = getVerifyHash(_codeGTIN, _invoiceNumber);
        if (warrantyDetails[tokenId].verifyHash == verifyHash) {
            warrantyDetails[tokenId].status = NFTStatus.Verified;

            emit WarrantyVerified(tokenId, msg.sender);

            return true;
        } else {
            return false;
        }
    }

    function tokenURI(
        uint256 _tokenId
    ) public view override(ERC721) returns (string memory) {
        require(
            _exists(_tokenId),
            "ERC721Metadata: URI query for nonexistent token"
        );
        return super.tokenURI(_tokenId);
    }

    /* function setBaseURI(string memory baseURI_) external {
        _baseURI = baseURI_;
    }*/

    function claimAndEnabledWarranty(uint256 _tokenId) public {
        require(_exists(_tokenId), "WarrantyContract: token does not exist");
        require(
            warrantyDetails[_tokenId].status == NFTStatus.Disabled,
            "This warranty is already active"
        );

        // Transfert de propriété de la garantie
        address owner = ownerOf(_tokenId);
        require(msg.sender != owner, "You already own this warranty");
        _transfer(owner, msg.sender, _tokenId);

        // Mise à jour du statut
        warrantyDetails[_tokenId].status = NFTStatus.Enabled;

        emit WarrantyEnabled(_tokenId);
    }

    function sellNFT(uint256 tokenId, uint256 price) public {
        require(_exists(tokenId), "ERC721Metadata: nonexistent token");
        require(
            _isApprovedOrOwner(msg.sender, tokenId),
            "ERC721: transfer caller is not owner nor approved"
        );
        require(price > 0, "Price should be greater than zero");

        // Transfer ownership to the smart contract
        safeTransferFrom(msg.sender, address(this), tokenId);

        // Register the sale contract address for this token
        _tokenSaleContracts[tokenId] = msg.sender;

        // Update the warranty status to reflect it's now for sale
        warrantyDetails[tokenId].status = NFTStatus.ForSale;
        warrantyDetails[tokenId].price = price;
        mSeller[msg.sender].allNFTsOnSale.push(tokenId);

        // Emit an event
        emit NFTForSale(tokenId, price, msg.sender);
    }

    function buyASecondHandGuarantee(uint256 _tokenId) public {
        require(_exists(_tokenId), "WarrantyContract: token does not exist");

        //récupérer le précédent seller et retirer le NFT de ses NFT à vendre
        //mSeller[msg.sender].allNFTsOnSale.push(tokenId);
    }

    function burn(uint256 tokenId) external {
        //TODO à implémenter
        emit NFTBurn(tokenId);
    }

    function disableWarranty(uint256 _tokenId) public {
        require(_exists(_tokenId), "WarrantyContract: token does not exist");
        WarrantyDetails storage warranty = warrantyDetails[_tokenId];
        require(
            ownerOf(_tokenId) == msg.sender,
            "WarrantyContract: caller is not the owner of the NFT"
        );
        require(
            warranty.status == NFTStatus.Enabled,
            "WarrantyContract: warranty is not active"
        );

        emit WarrantyDisabled(_tokenId);
    }

    function addSeller(address _seller) public {
        require(!_isSeller[_seller], "Seller already added");
        require(
            msg.sender == _seller,
            "Only the owner of the account can add it"
        );
        uint256 sellerId = _sellerIdCounter.current();

        _isSeller[_seller] = true;

        seller memory newSeller;
        newSeller.id = sellerId;
        newSeller.sellerAddress = msg.sender;
        newSeller.itemCounter = 0;
        allSellers[sellerId] = newSeller;
        addressToSellerId[msg.sender] = sellerId;
        //totalSellers.push(sellerId);

        _sellerIdCounter.increment();
    }

    function removeSeller(address _seller) public {
        require(_isSeller[_seller], "Seller not found");
        require(
            msg.sender == _seller,
            "Only the owner of the account can delete it"
        );
        _isSeller[_seller] = false;
    }

    function addConsumer(address _consumer) public {
        require(!_isConsumer[_consumer], "Consumer already added");
        require(
            msg.sender == _consumer,
            "Only the owner of the account can add it"
        );
        uint256 consumerId = _consumerIdCounter.current();

        _isConsumer[_consumer] = true;

        consumer memory newConsumer;
        newConsumer.id = consumerId;
        newConsumer.consumerAddress = msg.sender;
        newConsumer.itemCounter = 0;
        allConsumers[consumerId] = newConsumer;
        addressToConsumerId[msg.sender] = consumerId;
        //totalConsumer.push(consumerId);
        _consumerIdCounter.increment();
    }

    function removeConsumer(address _consumer) public {
        require(_isConsumer[_consumer], "consumer not found");
        require(
            msg.sender == _consumer,
            "Only the owner of the account can delete it"
        );
        _isConsumer[_consumer] = false;
    }

    function stringToBytes32(
        string memory str
    ) public pure returns (bytes32 result) {
        bytes memory tempEmptyStringTest = bytes(str);
        if (tempEmptyStringTest.length == 0) {
            return 0x0;
        }

        assembly {
            result := mload(add(str, 32))
        }
    }

    //READ Functions
    function getVerifyHash(
        string memory _codeGTIN,
        uint256 _invoiceNumber
    ) public pure returns (bytes32) {
        return keccak256(abi.encode(_codeGTIN, _invoiceNumber));
    }

    function isSeller(address _seller) public view returns (bool) {
        return _isSeller[_seller];
    }

    function isConsumer(address _consumer) public view returns (bool) {
        return _isConsumer[_consumer];
    }

    //récupérer tous les NFTS non mis en vente d'un vendeur
    function getAllNFTForASeller(
        address sellerAddress
    ) external view returns (uint256[] memory) {
        return mSeller[sellerAddress].allNFTs;
    }

    //récupérer les NFTS en vente d'un vendeur
    function getAllNFTOnSaleForASeller(
        address sellerAddress
    ) external view returns (uint256[] memory) {
        return mSeller[sellerAddress].allNFTsOnSale;
    }
}
