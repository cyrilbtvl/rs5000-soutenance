// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract GuarantifyNFTContract is ERC721URIStorage {
    using Strings for uint256;
    using Counters for Counters.Counter;

    // Variables for tracking NFT, Seller, and Consumer IDs
    Counters.Counter private _tokenIdCounter;
    Counters.Counter private _sellerIdCounter;
    Counters.Counter private _ConsumerIdCounter;

    // Mapping to store warranty details, NFT ownership, and Seller/Consumer data

    mapping(uint256 => WarrantyToken) public mWarrantyTokenById;
    mapping(uint256 => address) public mWarrantyOwnerAddressByTokenId;
    mapping(address => bool) private _mIsSellerByAddress;
    mapping(address => bool) private _mIsConsumerByAddress;
    mapping(address => Seller) public mSellersByAddress;
    mapping(address => Consumer) public mConsumersByAddress;
    //mapping(uint256 => bytes32) private _tokenIdToIPFSHash;
    //mapping(uint256 => address) private _mTokenSaleContracts;

    // Contract-level variables
    address public guarantifyContractAddress;
    //string private _baseURI;

    // Enums for NFT status
    enum WarrantyTokenStatus {
        Pending,
        Enabled,
        Expired,
        ForSale
    }

    // Structs for Sellers, Consumers, and warranty details
    struct Seller {
        uint256 id;
        address sellerAddress;
        uint256[] allNFTs;
        uint256[] allNFTsOnSale;
    }

    struct Consumer {
        uint256 id;
        address ConsumerAddress;
        uint256[] allNFTs;
        uint256[] allNFTsOnSale;
    }

    struct WarrantyToken {
        uint256 id;
        bytes32 verifyHash;
        WarrantyTokenStatus status;
        bytes32 codeGTIN;
        uint256 invoiceNumber;
        string productType;
        uint256 warrantyDurationInDay;
        uint256 purchaseDate;
        address sellerAddress;
        address buyer;
        uint256 price;
        uint256 resalePrice;

        //uint256 resallerAdress;
        //uint256[] buyers;
        //uint256[] buyersDate;
    }

    // Events
    event eventWarrantyTokenIsCreated(
        uint256 tokenId,
        string gtin,
        address owner
    );
    event eventWarrantyTokenIsPending(
        uint256 tokenId,
        string gtin,
        address owner
    );
    event eventWarrantyTokenIsEnabled(uint256 tokenId, address owner);
    event eventWarrantyTokenIsExpired(uint256 tokenId, address owner);
    event eventWarrantyTokenIsBurned(uint256 tokenId, address owner);
    event eventWarrantyTokenIsTransfered(
        uint256 tokenId,
        address owner,
        uint256 resalePrice,
        address to
    );
    event eventWarrantyTokenIsVerified(uint256 tokenId, address owner);

    //event eventWarrantyTokenIsOnSale(uint256 tokenId,uint256 price, address owner    );

    // Constructor
    constructor() ERC721("GuarantifyNFT", "GNFT") {
        guarantifyContractAddress = address(this);
        _addGuarantifyContractAddress();
    }

    // Modifier for only authorized Sellers
    modifier onlyAuthorizedSeller() {
        require(
            _mIsSellerByAddress[msg.sender],
            "Only Sellers can create warranties"
        );
        _;
    }

    function _baseURI() internal pure override returns (string memory) {
        return "https://ipfs.io/ipfs/";
    }

    //nommer _JSONHash à la palce de _tokenURI ?
    function createWarranty(
        string memory _codeGTIN,
        uint256 _invoiceNumber,
        string memory _productType,
        uint256 _warrantyDurationInDay,
        uint256 _price,
        string memory _tokenURI
    ) external onlyAuthorizedSeller returns (uint256) {
        uint256 tokenId = _tokenIdCounter.current();
        bytes32 verifyHash = getVerifyHash(_codeGTIN, _invoiceNumber);
        // Add the NFT metadata to the mapping
        WarrantyToken memory newWarranty = WarrantyToken({
            id: tokenId,
            verifyHash: verifyHash,
            status: WarrantyTokenStatus.Pending,
            codeGTIN: stringToBytes32(_codeGTIN),
            invoiceNumber: _invoiceNumber,
            productType: _productType,
            warrantyDurationInDay: _warrantyDurationInDay,
            purchaseDate: block.timestamp,
            sellerAddress: msg.sender,
            buyer: address(0),
            price: _price,
            resalePrice: 0
        });

        mWarrantyTokenById[tokenId] = newWarranty;
        mSellersByAddress[msg.sender].allNFTs.push(tokenId);
        mWarrantyOwnerAddressByTokenId[tokenId] = msg.sender;

        emit eventWarrantyTokenIsCreated(tokenId, _codeGTIN, msg.sender);

        _safeMint(msg.sender, tokenId);
        _setTokenURI(tokenId, _tokenURI); //_tokenURI = "https://ipfs.io/ipfs/bafybeihq5lkvgdrvb5anznlb53dgc3ise67ownsrgbfnrk7zth5jzaw2aa";
        _tokenIdCounter.increment();

        emit eventWarrantyTokenIsPending(tokenId, _codeGTIN, msg.sender);
        return tokenId;
    }

    //TODO devrait être renommé en verify hash token by gtin invoice
    // et creer un mapping  mWarrantyTokenByHash[hashToken] et une fontion qui l'appel avec en parametre _codeGTIN et numero de facture
    function verifyOwnershipByHash(
        uint256 tokenId,
        string memory _codeGTIN,
        uint256 _invoiceNumber
    ) external returns (bool) {
        require(
            _isApprovedOrOwner(msg.sender, tokenId),
            "ERC721: transfer caller is not owner nor approved"
        );

        bytes32 verifyHash = getVerifyHash(_codeGTIN, _invoiceNumber);
        if (mWarrantyTokenById[tokenId].verifyHash == verifyHash) {
            emit eventWarrantyTokenIsVerified(tokenId, msg.sender);

            return true;
        } else {
            return false;
        }
    }

    function tokenURI(
        uint256 _tokenId
    ) public view override(ERC721URIStorage) returns (string memory) {
        require(
            _exists(_tokenId),
            "ERC721Metadata: URI query for nonexistent token"
        );
        return super.tokenURI(_tokenId);
    }

    /* function setBaseURI(string memory baseURI_) external {
        _baseURI = baseURI_;
    }*/

    function claimAndEnabledWarranty(
        uint256 _tokenId,
        string memory _codeGTIN,
        uint256 _invoiceNumber
    ) external {
        require(_exists(_tokenId), "WarrantyContract: token does not exist");
        require(
            mWarrantyTokenById[_tokenId].status == WarrantyTokenStatus.Pending,
            "This warranty is not pending active"
        );
        require(
            isVerifyHash(_codeGTIN, _invoiceNumber, _tokenId),
            "WarrantyContract: hash not verify"
        );

        // Transfert de propriété de la garantie
        address owner = ownerOf(_tokenId);
        require(msg.sender != owner, "You already own this warranty");
        _transfer(owner, msg.sender, _tokenId);

        // Mise à jour du statut
        mWarrantyTokenById[_tokenId].status = WarrantyTokenStatus.Enabled;

        //suppression de la garantie du tableau du Seller
        _removeNFTInArray(mSellersByAddress[owner].allNFTs, _tokenId);

        //ajout de la garantie du tableau du Consumer
        mConsumersByAddress[msg.sender].allNFTs.push(_tokenId);
        mWarrantyOwnerAddressByTokenId[_tokenId] = msg.sender;

        emit eventWarrantyTokenIsEnabled(_tokenId, msg.sender);
    }

    /**
     * @dev Transfère une garantie à un nouveau propriétaire et fixe un prix de revente.
     * @param _to Adresse du nouveau propriétaire de la garantie.
     * @param _tokenId ID de la garantie à transférer.
     * @param _resalePrice Prix de revente de la garantie.
     * @notice Seul le propriétaire actuel de la garantie peut appeler cette fonction.
     * @notice La garantie doit être activée et en attente d'activation pour pouvoir être transférée.
     */
    function resell(
        address _to,
        uint256 _tokenId,
        uint256 _resalePrice
    ) external {
        require(_exists(_tokenId), "ERC721Metadata: nonexistent token");
        require(
            mWarrantyTokenById[_tokenId].status == WarrantyTokenStatus.Enabled,
            "This warranty is not enabled"
        );
        require(
            mWarrantyOwnerAddressByTokenId[_tokenId] == msg.sender,
            "Not Owner of this NFT warranty"
        );

        mWarrantyTokenById[_tokenId].resalePrice = _resalePrice;
        mWarrantyTokenById[_tokenId].sellerAddress = msg.sender;
        mWarrantyTokenById[_tokenId].buyer = _to;

        safeTransferFrom(msg.sender, _to, _tokenId);

        //suppression de la garantie du tableau du Seller
        _removeNFTInArray(mConsumersByAddress[msg.sender].allNFTs, _tokenId);

        //ajout de la garantie du tableau du Consumer
        mConsumersByAddress[_to].allNFTs.push(_tokenId);
        mWarrantyOwnerAddressByTokenId[_tokenId] = _to;

        emit eventWarrantyTokenIsTransfered(
            _tokenId,
            msg.sender,
            _resalePrice,
            _to
        );
    }

    function burn(uint256 _tokenId) external {
        require(_exists(_tokenId), "ERC721Metadata: nonexistent token");
        uint256 expiryDate = _getExpiryDate(_tokenId);
        require(block.timestamp >= expiryDate, "The garantie is not expired");
        emit eventWarrantyTokenIsExpired(_tokenId, msg.sender);
        _burn(_tokenId);

        _removeNFTInArray(mConsumersByAddress[msg.sender].allNFTs, _tokenId);
        mWarrantyOwnerAddressByTokenId[_tokenId] = address(0);
        mWarrantyTokenById[_tokenId].status = WarrantyTokenStatus.Expired;
        emit eventWarrantyTokenIsBurned(_tokenId, msg.sender);
    }

    function _getExpiryDate(
        uint256 _tokenId
    ) private view returns (uint256 expiry) {
        return
            mWarrantyTokenById[_tokenId].purchaseDate +
            (mWarrantyTokenById[_tokenId].warrantyDurationInDay * 86400);
    }

    function _addGuarantifyContractAddress() private {
        addSeller(guarantifyContractAddress);
    }

    function addSeller(address _Seller) public {
        require(_Seller != address(0), "Invalid Seller address");
        require(!_mIsSellerByAddress[_Seller], "Seller already added");
        require(
            msg.sender == _Seller || guarantifyContractAddress == _Seller,
            "Only the owner of the account can add it"
        );
        uint256 SellerIdCounter = _sellerIdCounter.current();
        _mIsSellerByAddress[_Seller] = true;

        // Create a new Seller struct
        Seller memory newSeller = Seller({
            id: SellerIdCounter,
            sellerAddress: _Seller,
            allNFTs: new uint256[](0),
            allNFTsOnSale: new uint256[](0)
        });

        // Add the new Seller to the mapping
        mSellersByAddress[_Seller] = newSeller;

        _sellerIdCounter.increment();
    }

    function addConsumer(address _Consumer) external {
        require(!_mIsConsumerByAddress[_Consumer], "Consumer already added");
        require(
            msg.sender == _Consumer,
            "Only the owner of the account can add it"
        );
        uint256 ConsumerIdCounter = _ConsumerIdCounter.current();

        _mIsConsumerByAddress[_Consumer] = true;

        // Create a new Seller struct
        Consumer memory newConsumer = Consumer({
            id: ConsumerIdCounter,
            ConsumerAddress: _Consumer,
            allNFTs: new uint256[](0),
            allNFTsOnSale: new uint256[](0)
        });

        // Add the new Seller to the mapping
        mConsumersByAddress[_Consumer] = newConsumer;

        _ConsumerIdCounter.increment();
    }

    function removeSeller(address _Seller) external {
        require(_mIsSellerByAddress[_Seller], "Seller not found");
        require(
            msg.sender == _Seller,
            "Only the owner of the account can delete it"
        );
        _mIsSellerByAddress[_Seller] = false;
        delete mSellersByAddress[msg.sender];
    }

    function removeConsumer(address _Consumer) external {
        require(_mIsConsumerByAddress[_Consumer], "Consumer not found");
        require(
            msg.sender == _Consumer,
            "Only the owner of the account can delete it"
        );
        _mIsConsumerByAddress[_Consumer] = false;
        delete mConsumersByAddress[msg.sender];
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

    function _removeNFTInArray(
        uint256[] storage _nfts,
        uint256 _tokenId
    ) private {
        for (uint i = 0; i < _nfts.length; i++) {
            if (_nfts[i] == _tokenId) {
                for (uint j = i; j < _nfts.length - 1; j++) {
                    _nfts[j] = _nfts[j + 1];
                }
                _nfts.pop();
                break;
            }
        }
    }

    //READ Functions
    function getVerifyHash(
        string memory _codeGTIN,
        uint256 _invoiceNumber
    ) public pure returns (bytes32) {
        return keccak256(abi.encode(_codeGTIN, _invoiceNumber));
    }

    function isVerifyHash(
        string memory _codeGTIN,
        uint256 _invoiceNumber,
        uint256 _tokenID
    ) public view returns (bool) {
        bytes32 hashSoumis = keccak256(abi.encode(_codeGTIN, _invoiceNumber));
        bytes32 hashInscrit = mWarrantyTokenById[_tokenID].verifyHash;
        return _compareHashes(hashSoumis, hashInscrit);
    }

    function _compareHashes(
        bytes32 hash1,
        bytes32 hash2
    ) private pure returns (bool) {
        if (hash1 == hash2) {
            return true;
        } else {
            return false;
        }
    }

    function isSeller(address _Seller) external view returns (bool) {
        return _mIsSellerByAddress[_Seller];
    }

    function isConsumer(address _Consumer) external view returns (bool) {
        return _mIsConsumerByAddress[_Consumer];
    }

    //récupérer tous les NFTS non mis en vente d'un vendeur
    function getAllNFTForASeller(
        address SellerAddress
    ) external view returns (uint256[] memory) {
        return mSellersByAddress[SellerAddress].allNFTs;
    }

    //récupérer les NFTS en vente d'un vendeur
    function getAllNFTOnSaleForASeller(
        address SellerAddress
    ) external view returns (uint256[] memory) {
        return mSellersByAddress[SellerAddress].allNFTsOnSale;
    }

    /*
    function sellNFTToContractMarketplace(
    function buyASecondHandGuarantee(uint256 _tokenId)
*/
}