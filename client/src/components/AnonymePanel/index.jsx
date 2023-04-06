import { useState } from "react";
import { Segment, Header, Button, Message, Icon, Grid, Divider, Modal } from "semantic-ui-react";
import { useEth } from "../../contexts/EthContext";


function AnonymePanel({ walletAddress }) {
  const [errorMessage, setErrorMessage] = useState("");
  const [open, setOpen] = useState(false);
  const [errorCode, setErrorCode] = useState("");

  const { state: { accounts, contract, artifact }, } = useEth();
  //setErrorCode(e.code);
  //console.error("OwnerPanel : mon erreur : " + errorCode);
  //setErrorMessage("Please add a correct address.");
  const createSeller = async () => {
    if (artifact) {
      try {

        await contract.methods.addSeller(walletAddress).send({ from: accounts[0] });
        //await contract.methods.addSeller(walletAddress).call({ from: accounts[0] });
        //emit eventWarrantyTokenSellerAdded(_Seller);
        console.log("AnonymePanel : new seller : " + walletAddress);

        //window.location.reload();

      } catch (e) {

        setOpen(true);
        setErrorCode(e.code);
        console.error("AnonymePanel : mon erreur addSeller : " + errorCode);
        setErrorMessage(e.message);
        console.error("AnonymePanel : mon erreur message addSeller : " + errorMessage);
      }
    } else {
      console.log("AnonymePanel : user not connected");
    }
  };

  return (
    walletAddress !== "" && (
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
        <Header as="h2">Anonyme's panel</Header>

        <Message>
          <Message.Header>Bienvenue sur notre application de gestion de garanties</Message.Header>
          <p>Merci de choisir votre type de compte pour l'adresse {walletAddress}</p>
        </Message>

        <Divider />

        <Segment>
          <Grid columns={2} relaxed='very' stackable>

            <Grid.Column width={8} verticalAlign='middle'>
              <Button positive size='huge' content='Créer un compte vendeur' onClick={createSeller} />
            </Grid.Column>
            <Grid.Column width={8} verticalAlign='middle'>
              <Button positive size='huge' content='Créer un compte consommateur' />
            </Grid.Column>
          </Grid>
          <Divider vertical><Icon name='arrows alternate horizontal' /></Divider>
        </Segment>
      </Segment >
    )
  );
}

export default AnonymePanel;