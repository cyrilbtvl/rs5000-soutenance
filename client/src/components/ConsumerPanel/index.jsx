import { useState } from "react";
import { Segment, Header, Button, Message, Icon, Grid, Divider, Modal } from "semantic-ui-react";
import { useEth } from "../../contexts/EthContext";


function ConsumerPanel({ walletAddress, isConsumer }) {
  const [errorMessage, setErrorMessage] = useState("");
  const [open, setOpen] = useState(false);
  const [errorCode, setErrorCode] = useState("");
  const { state: { accounts, contract, artifact }, } = useEth();

  const _isConsumer = async () => {
    if (artifact) {
      try {

        await contract.methods.isSeller(walletAddress).send({ from: accounts[0] });
        //await contract.methods.addSeller(walletAddress).call({ from: accounts[0] });
        //emit eventWarrantyTokenSellerAdded(_Seller);
        console.log("SellerPanel : new seller : " + walletAddress);

        //window.location.reload();

      } catch (e) {

        setOpen(true);
        setErrorCode(e.code);
        console.error("SellerPanel : mon erreur _isSeller : " + errorCode);
        setErrorMessage(e.message);
        console.error("SellerPanel : mon erreur message _isSeller : " + errorMessage);
      }
    } else {
      console.log("SellerPanel : user not connected");
    }
  };

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
          <Message.Header>Changes in Consumer Panel</Message.Header>
          <p>test Consumer panel </p>
        </Message>

        <Divider />

        <Segment>
          <Grid columns={2} relaxed='very' stackable>
            <Grid.Column width={10}>

              <Message>
                <Message.Header>Changes in Consumer PAnel</Message.Header>
                <p>test Consumer panel </p>
              </Message>

            </Grid.Column>
            <Grid.Column width={6} verticalAlign='middle'>
              <Button positive size='huge' content='Next step' onClick={_isConsumer} />
            </Grid.Column>
          </Grid>
          <Divider vertical><Icon name='angle double right' /></Divider>
        </Segment>
      </Segment >
    )
  );
}

export default ConsumerPanel;