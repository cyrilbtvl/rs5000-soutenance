import { useState, useEffect } from "react";
import { Segment, Header, Button, Message, Card, Divider, Modal, Image, Input } from "semantic-ui-react";
import { useEth } from "../../contexts/EthContext";
import Web3 from "web3";

import _ from 'lodash';


function ConsumerPanel({ walletAddress, walletAddressAnonymized, isSeller, isConsumer }) {
  const [errorMessage, setErrorMessage] = useState("");
  const [open, setOpen] = useState(false);
  const [errorCode, setErrorCode] = useState("");
  const { state: { accounts, contract, artifact }, } = useEth();

  const [consumerId, setConsumerId] = useState();
  const [allNFTs, setAllNFTs] = useState([]);
  const [allNFTSearch, setAllNFTsSearch] = useState([]);

  const [to, setTo] = useState();
  const [resalePrice, setResalePrice] = useState();


  const [search, setSearch] = useState();

  const web3 = new Web3();

  useEffect(() => {
    async function initConsumerPanel() {
      console.log("ConsumerPanel : useEffect initConsumerPanel : isSeller ", isSeller);
      console.log("ConsumerPanel : useEffect initConsumerPanel : isConsumer ", isConsumer);

      if (contract) {
        console.log("//// ConsumerPanel : initConsumerPanel , contract is OK \\\\\\\\ ");
        console.log("ConsumerPanel : useEffect initConsumerPanel : walletAddress ", walletAddress);
        let consumerData = await contract.methods.mConsumersByAddress(walletAddress).call();
        console.log("ConsumerPanel : useEffect initConsumerPanel : ConsumerData ", consumerData);
        setConsumerId(consumerData.id); // représentation de uint256 avec number
        console.log("ConsumerPanel : useEffect initConsumerPanel : ConsumerId ", consumerId);
        //setConsumerAddress(ConsumerData.ConsumerAddress); // représentation de address avec string

        let ConsumerNFTs = await contract.methods.getAllNFTForAConsumer(walletAddress).call();

        if (ConsumerNFTs) {
          console.log("ConsumerPanel : useEffect initConsumerPanel : allNFTs ", ConsumerNFTs);
          let warrantyTokens = [];
          const web3 = new Web3();
          for (let i = 0; i < ConsumerNFTs.length; i++) {
            let warrantyToken = await contract.methods.mWarrantyTokenById(ConsumerNFTs[i]).call();
            let urlJSON = await contract.methods.mWarrantyURITokenById(warrantyToken.id).call();
            console.log("ConsumerPanel : url ", urlJSON);

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
              //setAllNFTs(ConsumerData.allNFTs.map(nft => parseInt(nft)));
            } catch (error) {
              console.log(error);
              setErrorMessage(error.message);
              setErrorCode(error.code);
            }
          }

        }

        //setAllNFTsOnSale(ConsumerData.allNFTsOnSale); // représentation de address[] avec string[]
      } else {
        console.log("//// ConsumerPanel : initConsumerPanel ,no contract\\\\\\\\ ");
      }
    };
    initConsumerPanel();
  }, [accounts, contract, artifact, isConsumer, isConsumer, allNFTSearch, setAllNFTsSearch]);



  // TODO A remplacer par les NFT
  async function searchNFT() {
    console.log("searchNFT : init");
    let warrantyTokens = [];
    setAllNFTsSearch(warrantyTokens);
    try {
      console.log("searchNFT : allNFTs ", search);
      let warrantyToken = await contract.methods.mWarrantyTokenById(search).call();
      console.log("searchNFT : warrantyToken ", warrantyToken.id);
      let urlJSON = await contract.methods.mWarrantyURITokenById(warrantyToken.id).call();
      console.log("ConsumerPanel : url ", urlJSON);

      try {
        const response = await fetch(urlJSON);
        const data = await response.json();
        const _urlFile = data.imageHash;

        warrantyToken.urlFile = "https://gateway.pinata.cloud/ipfs/" + _urlFile; //url.url;


        let codeGTINInString = web3.utils.hexToAscii(warrantyToken.codeGTIN);
        codeGTINInString = codeGTINInString.replace(/\0/g, '');
        console.log("codeGTINInString : ", codeGTINInString);

        warrantyToken.stringCodeGTIN = codeGTINInString;
        warrantyTokens.push(warrantyToken);
        console.log("--- warrantyTokens : ", warrantyTokens);
        setAllNFTsSearch(warrantyTokens);
        //setAllNFTs(ConsumerData.allNFTs.map(nft => parseInt(nft)));
      } catch (error) {
        console.log(error);
        setErrorMessage(error.message);
        setErrorCode(error.code);
      }
    } catch (e) {
      console.error("searchNFT : mWarrantyTokenById : ", e);
    }
    /*
        const NFTsearch = [
          {
            urlFile: 'https://gateway.pinata.cloud/ipfs/QmXQrgwWVMz2jyjkPDad6BuFiyRcViJnmZozLZaLkdj7Ld',
            warrantyDurationInDay: 'Joined in 2013',
            productType: 'Helen',
            codeGTIN: 'Primary Contact',
            invoiceNumber: "813385",
          }
        ]
        if (search === "33") {
          setAllNFTsSearch(NFTsearch);
        } else {
          console.log("searchNFT : not 33: search ", search);
        }*/

  }
  async function claim() {
    console.log("ConsumerPanel : claim ");

    try {
      console.log("claim : search ", search);
      const _allNFTsSearch = allNFTSearch[0];
      console.log("claim : _allNFTsSearch.codeGTIN : ", _allNFTsSearch.codeGTIN);
      let codeGTINInString = web3.utils.hexToAscii(_allNFTsSearch.codeGTIN);
      codeGTINInString = codeGTINInString.replace(/\0/g, '');
      const id = parseInt(_allNFTsSearch.id);
      const invoiceNumber = parseInt(_allNFTsSearch.invoiceNumber);
      if (isNaN(id) || isNaN(invoiceNumber)) {
        console.error("parseInt : isNaN");
      } else {
        console.log("claim : id :  ", id);
        console.log("claim : codeGTIN :  ", codeGTINInString);
        console.log("claim : invoiceNumber :  ", invoiceNumber);
        //const codeGTIN = "GTIN455";
        //const invoiceNumber = 4433;
        await contract.methods.claimAndEnabledWarranty(id, codeGTINInString, invoiceNumber).send({ from: accounts[0] });
        console.log("Garantie " + id + " récupérée et activée.");
      }


    } catch (e) {
      console.error("claim - error:  ", e);
      console.error("claim - message:  ", e.message);
      console.error("claim - code:  ", e.code);
    }
  }


  async function sell(id) {
    console.log("ConsumerPanel : sell : le tocken id - ", id);
    console.log("ConsumerPanel : sell : à ", to);
    console.log("ConsumerPanel : sell : au prix de : ", resalePrice);

    try {

      await contract.methods.resell(to, id, resalePrice).send({ from: accounts[0] });
      //await contract.methods.addConsumer(walletAddress).call({ from: accounts[0] });
      //emit eventWarrantyTokenConsumerAdded(_Consumer);
      console.log("ConsumerPanel : resell : NFT " + id + " vendu à " + to);

      //window.location.reload();

    } catch (e) {

      setOpen(true);
      setErrorCode(e.code);
      console.error("ConsumerPanel : mon erreur _isConsumer : " + errorCode);
      setErrorMessage(e.message);
      console.error("ConsumerPanel : mon erreur message _isConsumer : " + errorMessage);
    }
  }

  return (
    isConsumer && (
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
        <Header as="h2">Consumer's panel</Header>

        <Message>
          <Message.Header>Vos informations : </Message.Header>
          <p>adresse de wallet : {walletAddressAnonymized} </p>
          <p>identifiant client : {consumerId} </p>
        </Message>


        <Divider />

        <Segment>
          <Card.Group doubling itemsPerRow={3} stackable>
            {_.map(allNFTs, (card) => (
              <Card key={card.id}>
                <Image src={card.urlFile} />
                <Card.Content>
                  <>
                    <Card.Header>{card.productType}</Card.Header>
                    <Card.Meta>Token ID : {card.id}</Card.Meta>
                    <Card.Meta>Code GTIN : {card.stringCodeGTIN}</Card.Meta>
                    <Card.Meta>Numéro de facture : {card.invoiceNumber}</Card.Meta>
                    <Card.Description>Jour de garantie initial : {card.warrantyDurationInDay}</Card.Description>
                  </>
                </Card.Content>
                <Card.Content extra>
                  <div className="field required">
                    <label>Adresse du destinataire</label>
                    <Input placeholder='0x..' onChange={(event) => setTo(event.target.value)} />
                  </div>
                  <div className="field required">
                    <label>Prix de revente</label>
                    <Input placeholder='ex:32' onChange={(event) => setResalePrice(event.target.value)} />
                  </div>
                  <Button primary onClick={() => sell(card.id)}>Vendre</Button>
                </Card.Content>
              </Card>
            ))}
          </Card.Group>
        </Segment>
        <Divider />

        <Segment>
          <Input placeholder='searchNFT' onChange={(e) => setSearch(e.target.value)} /><Button icon='search' onClick={searchNFT} />

          <Card.Group doubling itemsPerRow={1} stackable>
            {_.map(allNFTSearch, (card) => (
              <Card key={card.id}>
                <Image src={card.urlFile} />
                <Card.Content>
                  <>
                    <Card.Header>{card.productType}</Card.Header>
                    <Card.Meta>Token ID : {card.id}</Card.Meta>
                    <Card.Meta>Code GTIN : {card.stringCodeGTIN}</Card.Meta>
                    <Card.Meta>Numéro de facture : {card.invoiceNumber}</Card.Meta>
                    <Card.Description>Jour de garantie initial : {card.warrantyDurationInDay}</Card.Description>
                  </>
                </Card.Content>

                <Card.Content extra>
                  <Button primary onClick={() => claim()}>Activer</Button>
                </Card.Content>
              </Card>
            ))}
          </Card.Group>
        </Segment>
      </Segment >
    )
  );
}


export default ConsumerPanel;