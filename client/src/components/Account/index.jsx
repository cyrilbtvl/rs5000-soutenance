import { useEffect } from "react";
import { Image, Segment } from "semantic-ui-react";
import { useEth } from "../../contexts/EthContext";

function Account({ isConsumer, setIsConsumer, isSeller, setIsSeller, walletAddress, walletAddressAnonymized }) {
  const { state: { accounts, contract, artifact }, } = useEth(); //????

  useEffect(() => {
    async function getTypeOfUser() {
      if (artifact) {
        console.log("Account : useEffect getTypeOfUser : ", accounts[0]);
        try {
          const isSellerUser = await contract.methods.isSeller(accounts[0]).call();
          console.log("isSellerUser : ", isSellerUser);
          if (isSellerUser) {
            setIsSeller(true);
          } else {
            setIsSeller(false);
            try {
              const isConsumerUser = await contract.methods.isConsumer(accounts[0]).call({ from: accounts[0] });
              console.log("isConsumerUser : ", isConsumerUser);
              if (isConsumerUser) {
                setIsConsumer(true);
              } else {
                setIsConsumer(false);
              }
            } catch (e) {
              console.log("Account : " + e);
            }

          }
        } catch (e) {
          console.log("Account exception : " + e);
        }
      } else {
        console.log("Account : user not connected");
      }
    };
    getTypeOfUser();

  }, [accounts, contract, artifact, isSeller, isConsumer, setIsConsumer, setIsSeller]);

  return (

    !artifact && !isSeller && !isConsumer &&
    <Segment>
      <Image src='https://gateway.pinata.cloud/ipfs/QmYw2XCfj16HFSgyo8eLU3C3RXQCcRMjY5PHXvwp31gQXa' size='small' centered="true" />
    </Segment>
  );
}

export default Account;
