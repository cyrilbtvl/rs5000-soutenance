import { useState, useEffect } from "react";
import { Message, Icon } from "semantic-ui-react";
import { useEth } from "../../contexts/EthContext";

//import { getCurrentWalletConnected } from "../../util/connectWallet.js";

function Account({ isConsumer, setIsConsumer, isSeller, setIsSeller, walletAddress }) {
  const { state: { accounts, contract, artifact }, } = useEth(); //????
  const [account, setAccount] = useState("");

  //const [walletAddress, setWallet] = useState("");
  //const [isConsumer, setIsConsumer] = useState(false);
  //const [isSeller, setIsSeller] = useState(false);

  /*
  useEffect(() => {
     async function getCurrentWallet() {
       const { address } = await getCurrentWalletConnected();
       setWallet(address);
     }
 
     getCurrentWallet();
    addWalletListener();
  }, [walletAddress]);
*/
  useEffect(() => {
    async function getAccount() {
      if (accounts) {
        setAccount(accounts[0]);
      }
    };
    getAccount();
  }, [accounts]);

  useEffect(() => {
    /*async function getAccount() {
      if (accounts) {
        setAccount(accounts[0]);
      }
    };*/
    async function getTypeOfUser() {
      if (artifact) {
        console.log("Account : user connected : ", accounts[0]);
        try {
          // On check si l'account courant est l'owner du contract
          //const isSellerUser = await contract.methods.isSeller(accounts[0]).call({ from: accounts[0] });
          const isSellerUser = await contract.methods.isSeller(accounts[0]).call();
          console.log("isSellerUser : ", isSellerUser);
          if (isSellerUser) {
            setIsSeller(true);
          } else {
            setIsSeller(false);
            try {
              const isConsumerUser = await contract.methods.isConsumer(accounts[0]).call({ from: accounts[0] });
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
      /*
            let allVoterRegistered = await contract.getPastEvents('eventWarrantyTokenSellerAdded', { fromBlock: 0, toBlock: "latest" });
                let allVoterAddress = allVoterRegistered.map(_ev => _ev.returnValues.voterAddress);
                let isSeller = allVoterAddress.includes(accounts[0]);
                console.log("Account : isSeller ? " + isSeller);*/
    };


    //getAccount();
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
        <Message icon='user secret' color='blue' header='Dear seller, you are connected with this address' content={account} />
      ) :
        isConsumer ? (
          <Message icon='user' color='green' header='Dear consumer, you are connected with this address' content={account} />
        ) : (
          <Message icon color='orange'>
            <Icon name='user outline' />
            <Message.List>
              <Message.Item>Dear user, you are not enregistred.</Message.Item>
              <Message.Item>You are connected with this address : {walletAddress}</Message.Item>
            </Message.List>
          </Message >
        )
  );
}

export default Account;
