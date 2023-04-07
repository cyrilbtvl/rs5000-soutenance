import { useEffect, useState } from "react";
import { Form, Button, Message } from "semantic-ui-react";
import { connectWallet, getCurrentWalletConnected } from "../../util/connectWallet.js";
//import { useEth } from "../../contexts/EthContext";

function WalletBtnConnect({ walletAddress, setWalletAddress, walletAddressAnonymized, setWalletAddressAnonymized }) {
  // const [walletAddress, setWalletAddress] = useState("");
  const [status, setStatus] = useState("");
  //const { state: { accounts, contract, artifact }, } = useEth();


  async function fetchData() {
    const { address, status } = await getCurrentWalletConnected();
    console.log("WalletBtnConnect : getCurrentWalletConnected : " + address);

    anonymizedAddress(address);
    setStatus(status);
    addWalletListener();
  }

  useEffect(() => {
    fetchData();
  }, [setWalletAddress]);

  function anonymizedAddress(address) {
    if (address.length > 38) {
      console.log("AnonymePanel : walletAddress : " + address);
      walletAddressAnonymized = String(address).substring(0, 6) + "..." + String(address).substring(38);
      console.log("AnonymePanel : walletAddressAnonymized : " + walletAddressAnonymized);
    } else {
      walletAddressAnonymized = address;
    }
    setWalletAddressAnonymized(walletAddressAnonymized);
    setWalletAddress(address);

  }

  function addWalletListener() {
    if (window.ethereum) {
      window.ethereum.on("accountsChanged", (accounts) => {
        if (accounts.length > 0) {
          setWalletAddress(accounts[0]);
          anonymizedAddress(accounts[0])
          console.log("WalletBtnConnect : accountsChanged : " + accounts[0]);
          setStatus("");
        } else {
          setWalletAddress("");
          anonymizedAddress("")
          setStatus("🦊 Connect to Metamask using the button below.");
        }
      });
    }
  }

  const formconnectWalletPressedSubmit = async () => {
    const walletResponse = await connectWallet();
    console.log("WalletBtnConnect : connectWallet : " + walletResponse.address);
    setWalletAddress(walletResponse.address);
    setStatus(walletResponse.status);
  };

  return (
    walletAddress === "" && status !== "" ? (
      <div>

        <Message>
          {/*<Message.Header>Changes in Service</Message.Header>*/}
          <p>{status} </p>
        </Message>

        <Form onSubmit={formconnectWalletPressedSubmit}>
          <Button icon='add user' content='Se connecter' color="blue" type="submit" size="huge" fluid />
        </Form>

      </div >
    ) : walletAddress === "" && status === "" ? (

      <Form onSubmit={formconnectWalletPressedSubmit}>
        <Button icon='add user' content='Se connecter' color="blue" type="submit" size="huge" fluid />
      </Form>

    ) : (
      <Message>
        <Message.Header>WalletBtnConnect : OK</Message.Header>
        <p>{walletAddress} </p>
      </Message>
    )
  )

}
export default WalletBtnConnect;
