//import { useState, useEffect } from "react";
import { useEffect } from "react";
import { Message, Icon } from "semantic-ui-react";
import { useEth } from "../../contexts/EthContext";

function Account({ isConsumer, setIsConsumer, isSeller, setIsSeller, walletAddress, walletAddressAnonymized }) {
  const { state: { accounts, contract, artifact }, } = useEth(); //????
  /* const [account, setAccount] = useState("");
 
   useEffect(() => {
     async function getAccount() {
       if (accounts) {
         setAccount(accounts[0]);
         console.log("Account : useEffect getAccount  : accounts[0] : ", accounts[0]);
       }
       console.log("Account : useEffect getAccount : walletAddress ", walletAddress);
       console.log("Account : useEffect getAccount : walletAddressAnonymized ", walletAddressAnonymized);
     };
     getAccount();
   }, [accounts]);*/

  useEffect(() => {
    async function getTypeOfUser() {
      if (artifact) {
        console.log("Account : useEffect getTypeOfUser : ", accounts[0]);
        try {
          //const isSellerUser = await contract.methods.isSeller(accounts[0]).call({ from: accounts[0] });
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
        //alert("pas de contract détecté");
      }
    };
    getTypeOfUser();

  }, [accounts, contract, artifact, isSeller, isConsumer, setIsConsumer, setIsSeller]);

  /* function addWalletListener() {
     if (window.ethereum) {
       window.ethereum.on("accountsChanged", (accounts) => {
         if (accounts.length > 0) {
           setWallet(accounts[0]);
         } else {
           setWallet("");
         }
       });
     }
   }*/
  return (

    !artifact && walletAddress === "" ? (
      <Message icon='user times' color='red' header='Dear user' content="You are not connected" />
    ) :
      isSeller ? (
        <Message icon='user secret' color='blue' header='Dear seller, you are connected with this address' content={walletAddressAnonymized} />
      ) :
        isConsumer ? (
          <Message icon='user' color='green' header='Dear consumer, you are connected with this address' content={walletAddressAnonymized} />
        ) : (
          <Message icon color='orange'>
            <Icon name='user outline' />
            <Message.List>
              <Message.Item>Dear user, you are not enregistred.</Message.Item>
              <Message.Item>You are connected with this address : {walletAddressAnonymized}</Message.Item>
            </Message.List>
          </Message >
        )
  );
}

export default Account;
