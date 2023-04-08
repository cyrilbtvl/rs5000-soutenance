import { useEffect, useState } from "react";
import { Form, Button, Message, Image } from "semantic-ui-react";
import { connectWallet, getCurrentWalletConnected } from "../../util/connectWallet.js";

function WalletBtnConnect({ walletAddress, setWalletAddress, walletAddressAnonymized, setWalletAddressAnonymized }) {
  const [status, setStatus] = useState("");

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

        <Image src='https://gateway.pinata.cloud/ipfs/QmYw2XCfj16HFSgyo8eLU3C3RXQCcRMjY5PHXvwp31gQXa' size='small' centered="true" />
        <Message>
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

      <Image src='https://gateway.pinata.cloud/ipfs/QmYw2XCfj16HFSgyo8eLU3C3RXQCcRMjY5PHXvwp31gQXa' size='small' centered="true" />

    )
  )

}
export default WalletBtnConnect;
