import { useState, useEffect } from "react";
import { Segment, Header, Button, Message, Divider, Modal, Form, Card, Image, Input } from "semantic-ui-react";
import { useEth } from "../../contexts/EthContext";
import axios from "axios";
import Web3 from "web3";

import _ from 'lodash';
require('dotenv').config();
const pinatakey = process.env.REACT_APP_PINATA_KEY;
const pinatasecret = process.env.REACT_APP_PINATA_SECRET;

function SellerPanel({ walletAddress, walletAddressAnonymized, isSeller, isConsumer }) {


  const [errorMessage, setErrorMessage] = useState("");
  const [open, setOpen] = useState(false);
  const [errorCode, setErrorCode] = useState("");
  const { state: { accounts, contract, artifact }, } = useEth();

  const [gtin, setGTIN] = useState("");
  const [invoiceNumber, setInvoiceNumber] = useState();
  const [typeOfProduct, setTypeOfProduct] = useState("");
  const [price, setPrice] = useState();
  const [warrantyDurationInDay, setWarrantyDurationInDay] = useState();
  const [tokenURI, setTokenURI] = useState("");
  const [selectedFile, setSelectedFile] = useState("");
  //const [hashFileIpfs, setHashFileIpfs] = useState("");

  const [sellerId, setSellerId] = useState();
  const [allNFTs, setAllNFTs] = useState([]);
  //const [sellerAddress, setSellerAddress] = useState("");
  //const [allNFTsOnSale, setAllNFTsOnSale] = useState([]);

  useEffect(() => {
    async function initSellerPanel() {
      console.log("SellerPanel : useEffect initSellerPanel : isSeller ", isSeller);
      console.log("SellerPanel : useEffect initSellerPanel : isConsumer ", isConsumer);
      if (contract) {
        console.log("//// SellerPanel : initSellerPanel , contract is OK \\\\\\\\ ");
        console.log("SellerPanel : useEffect initSellerPanel : walletAddress ", walletAddress);
        let sellerData = await contract.methods.mSellersByAddress(walletAddress).call();
        console.log("SellerPanel : useEffect initSellerPanel : sellerData ", sellerData);
        setSellerId(sellerData.id); // représentation de uint256 avec number
        console.log("SellerPanel : useEffect initSellerPanel : sellerId ", sellerId);
        //setSellerAddress(sellerData.sellerAddress); // représentation de address avec string

        let sellerNFTs = await contract.methods.getAllNFTForASeller(walletAddress).call();

        if (sellerNFTs) {
          console.log("SellerPanel : useEffect initSellerPanel : allNFTs ", sellerNFTs);
          let warrantyTokens = [];
          const web3 = new Web3();
          for (let i = 0; i < sellerNFTs.length; i++) {
            let warrantyToken = await contract.methods.mWarrantyTokenById(sellerNFTs[i]).call();
            let urlJSON = await contract.methods.mWarrantyURITokenById(warrantyToken.id).call();
            console.log("SellerPanel : url ", urlJSON);

            try {
              const response = await fetch(urlJSON);
              const data = await response.json();
              const _urlFile = data.imageHash;

              warrantyToken.urlFile = "https://gateway.pinata.cloud/ipfs/" + _urlFile; //url.url;
              let codeGTINInString = web3.utils.hexToAscii(warrantyToken.codeGTIN).trim();
              console.log("codeGTINInString : ", codeGTINInString);

              warrantyToken.stringCodeGTIN = codeGTINInString;
              warrantyTokens.push(warrantyToken);
              console.log("--- warrantyTokens : ", warrantyTokens);
              setAllNFTs(warrantyTokens);
              //setAllNFTs(sellerData.allNFTs.map(nft => parseInt(nft)));
            } catch (error) {
              console.log(error);
            }
          }

        }

        //setAllNFTsOnSale(sellerData.allNFTsOnSale); // représentation de address[] avec string[]
      } else {
        console.log("//// SellerPanel : initSellerPanel ,no contract\\\\\\\\ ");
      }
    };
    initSellerPanel();
  }, [accounts, contract, artifact, isSeller, isConsumer]);

  const handleSubmission = async () => {


    console.log("SellerPanel : _isSeller : gtin - ", gtin);
    console.log("SellerPanel : _isSeller : invoiceNumber - ", invoiceNumber);
    console.log("SellerPanel : _isSeller : typeOfProduct - ", typeOfProduct);
    console.log("SellerPanel : _isSeller : warrantyDurationInDay - ", warrantyDurationInDay);
    console.log("SellerPanel : _isSeller : price - ", price);
    console.log("SellerPanel : _isSeller : selectedFile - ", selectedFile);

    const formData = new FormData();
    formData.append('file', selectedFile)

    const metadata = JSON.stringify({ name: 'File name', });
    formData.append('pinataMetadata', metadata);

    const options = JSON.stringify({ cidVersion: 0, })
    formData.append('pinataOptions', options);

    if (selectedFile === "") {
      console.error("Veuillez selectionner un fichier image");
    } else {
      try {
        console.log("SellerPanel : handleSubmission : pinatakey - ", pinatakey);
        console.log("SellerPanel : handleSubmission : pinatasecret - ", pinatasecret);

        //pinFileToIPFS
        const res = await axios.post("https://api.pinata.cloud/pinning/pinFileToIPFS", formData, {
          maxBodyLength: "Infinity",
          headers: {
            'Content-Type': `multipart/form-data; boundary=${formData._boundary}`,
            pinata_api_key: pinatakey,
            pinata_secret_api_key: pinatasecret,
            //Authorization: JWT
          }
        });
        console.log('réponse pinFileToIPFS : data : ', res.data);
        const IpfsHash = res.data.IpfsHash;
        console.log('réponse pinFileToIPFS : IpfsHash : ', IpfsHash);

        if (artifact) {


          //window.location.reload();
          //console.log('onMintPressed : hashFileIpfs : ', hashFileIpfs);
          if (typeof IpfsHash === 'undefined' || IpfsHash === "" || gtin.trim() === "" || typeOfProduct.trim() === "") {
            console.error('Tous les champs sont obligatoire');
            console.error('Vous ne pouvez pas minter : hashFileIpfs is ', IpfsHash);
          } else {

            //DEBUT PinJSONToIPFS
            const metadata = {
              gtin: gtin,
              invoiceNumber: invoiceNumber,
              typeOfProduct: typeOfProduct,
              warrantyDurationInDay: warrantyDurationInDay,
              price: price,
              imageHash: IpfsHash
            };


            const url = `https://api.pinata.cloud/pinning/pinJSONToIPFS`;
            const resPinJSONToIPFS = await axios.post(url, metadata, {
              headers: {
                pinata_api_key: pinatakey,
                pinata_secret_api_key: pinatasecret,
              }
            })
              .then(function (response) {
                console.log("pinata.js - pinJSONToIPFS : response post", response.data.IpfsHash);
                return {
                  success: true,
                  pinataUrl: "https://gateway.pinata.cloud/ipfs/" + response.data.IpfsHash
                };
              })
              .catch(function (error) {
                console.error("pinata.js - pinJSONToIPFS : error", error);
                return {
                  success: false,
                  message: error.message,
                }

              });

            console.log('==========>SellerPanel : onMintPressed - resPinJSONToIPFS ', resPinJSONToIPFS);
            const pinataUrl = resPinJSONToIPFS.pinataUrl;
            setTokenURI(pinataUrl);
            console.log('SellerPanel : onMintPressed - pinataUrl ', pinataUrl);

            //FIN PinJSONToIPFS



            //console.log('SellerPanel : onMintPressed - tokenURI ', tokenURI);
            if (pinataUrl !== "") {
              try {
                const resTokenId = await contract.methods.createWarranty(gtin, invoiceNumber, typeOfProduct, warrantyDurationInDay, price, pinataUrl).send({ from: accounts[0] });
                console.log("SellerPanel : createWarranty : resTokenId - ", resTokenId);

                //let sellerData = await contract.methods.mSellersByAddress(walletAddress).call();
                //console.log("SellerPanel : createWarranty :NFTs : ", sellerData.allNFTs);

              } catch (e) {

                setOpen(true);
                setErrorCode(e.code);
                console.error("SellerPanel : mon erreur _isSeller : " + errorCode);
                setErrorMessage(e.message);
                console.error("SellerPanel : mon erreur message _isSeller : " + errorMessage);
              }
            } else {
              console.error("SellerPanel : tokenURI is empty");
            }
          }

        } else {
          console.log("SellerPanel : user not connected");
        }
      } catch (error) {
        console.error(error);
      }
    }
  };

  const handleFileChange = (event) => {
    console.log('event.target.files[0] : ', event.target.files[0]);
    setSelectedFile(event.target.files[0]);

    console.log('selectedFile : ', selectedFile);
  };

  // TODO A remplacer par les NFT
  /*
    const allNFT = [
      {
        urlFile: 'https://gateway.pinata.cloud/ipfs/QmXQrgwWVMz2jyjkPDad6BuFiyRcViJnmZozLZaLkdj7Ld',
        warrantyDurationInDay: 'Joined in 2013',
        productType: 'Helen',
        codeGTIN: 'Primary Contact',
        invoiceNumber: "813385",
      },
      {
        urlFile: 'https://gateway.pinata.cloud/ipfs/QmNbLbs6WPDry7nUitTqvxu4i3gUrgT2pFj7wC2kpEhvU2',
        warrantyDurationInDay: 'Joined in 2013',
        productType: 'Matthew',
        codeGTIN: 'Primary Contact',
        invoiceNumber: "99988",
      },
      {
        urlFile: 'https://gateway.pinata.cloud/ipfs/Qmf5Tp3W7Am2YVJ3HdzsSUYjjNxMEBp7VyiKADZ4aHvUAc',
        warrantyDurationInDay: 'Joined in 2013',
        productType: 'Molly',
        codeGTIN: 'Primary Contact',
        invoiceNumber: "554568",
      },
    ]*/

  return (
    isSeller && (
      <Segment raised size="huge" color="blue">
        <Modal
          centered={false}
          open={open}
          onClose={() => setOpen(false)}
          onOpen={() => setOpen(true)}
        >
          <Header className="ui red header" icon='warning sign' content={errorCode} />
          <Modal.Content>
            <Modal.Description>
              {errorMessage}
            </Modal.Description>
          </Modal.Content>
          <Modal.Actions>
            <Button positive onClick={() => setOpen(false)}>OK</Button>
          </Modal.Actions>
        </Modal>
        <Header as="h2">Seller's panel</Header>

        <Message>
          <Message.Header>Vos informations : </Message.Header>
          <p>adresse de wallet : {walletAddressAnonymized} </p>
          <p>identifiant de vendeur : {sellerId} </p>
        </Message>

        <Divider />

        <Segment>

          { /*
          string memory _codeGTIN,
          uint256 _invoiceNumber,
          string memory _productType,
          uint256 _warrantyDurationInDay,
          uint256 _price,
          string memory _tokenURI
  
    */}
          <link rel="stylesheet" href=
            "https://cdnjs.cloudflare.com/ajax/libs/semantic-ui/2.4.1/semantic.min.css" />


          <Form>

            <div className="field required">
              <label>Code GTIN du produit</label>
              <Input placeholder='Code GTIN' onChange={(event) => setGTIN(event.target.value)} />
            </div>
            <div className="field required">
              <label>Numéro de facture du produit</label>
              <Input placeholder='N° Facture' onChange={(event) => setInvoiceNumber(event.target.value)} />
            </div>
            <div className="field required">
              <label>Type de produit</label>
              <Input placeholder='ex: smartphone' onChange={(event) => setTypeOfProduct(event.target.value)} />
            </div>

            <div className="field required">
              <label>Durée de la garantie en jours</label>
              <Input placeholder='ex: 365' onChange={(event) => setWarrantyDurationInDay(event.target.value)} />
            </div>
            <div className="field required">
              <label>Prix du produit en euros</label>
              <Input placeholder='ex: 100' onChange={(event) => setPrice(event.target.value)} />
            </div>


            <div className="field required">
              <label className="form-label">Choisi une image</label>
              <Input type='file' onChange={handleFileChange} />
            </div>

            <Button icon='file image' content='Créer un NFT Garantie' color="green" type="submit" size="huge" fluid onClick={handleSubmission} />
          </Form>

        </Segment>

        <Divider />

        <Segment>
          <Card.Group doubling itemsPerRow={3} stackable>
            {_.map(allNFTs, (card) => (
              <Card key={card.productType}>
                <Image src={card.urlFile} />
                <Card.Content>
                  <>
                    <Card.Header>{card.productType}</Card.Header>
                    <Card.Meta>Code GTIN : {card.stringCodeGTIN}</Card.Meta>
                    <Card.Meta>Numéro de facture : {card.invoiceNumber}</Card.Meta>
                    <Card.Description>Jour de garantie initial : {card.warrantyDurationInDay}</Card.Description>
                  </>
                </Card.Content>
                <Card.Content extra>
                  <Button primary>
                    Add
                  </Button>
                  <Button >Delete</Button>
                </Card.Content>
              </Card>
            ))}
          </Card.Group>
        </Segment>
      </Segment >
    )
  );
}

export default SellerPanel;