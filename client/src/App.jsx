import { EthProvider } from "./contexts/EthContext";
import { useState } from "react";
//import { Message } from 'semantic-ui-react';

import WalletBtnConnect from "./components/WalletBtnConnect";
import Account from "./components/Account";

import SellerPanel from "./components/SellerPanel";
import ConsumerPanel from "./components/ConsumerPanel";
import AnonymePanel from "./components/AnonymePanel";


import "./App.css";

function App() {
  const [isConsumer, setIsConsumer] = useState(false);
  const [isSeller, setIsSeller] = useState(false);
  const [walletAddress, setWalletAddress] = useState("");

  return (
    <EthProvider>
      <div id="App">
        <div className="container">
          <WalletBtnConnect walletAddress={walletAddress} setWalletAddress={setWalletAddress} />
          <Account isConsumer={isConsumer} setIsConsumer={setIsConsumer} isSeller={isSeller} setIsSeller={setIsSeller} walletAddress={walletAddress} />
          <AnonymePanel walletAddress={walletAddress} isConsumer={isConsumer} isSeller={isSeller} />
          <SellerPanel walletAddress={walletAddress} isSeller={isSeller} />
          <ConsumerPanel walletAddress={walletAddress} isConsumer={isConsumer} />
          {/*
          */}
        </div>
      </div>
    </EthProvider>
  );
}

export default App;
