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
  const [walletAddressAnonymized, setWalletAddressAnonymized] = useState("");

  return (
    <EthProvider>
      <div id="App">
        <div className="container">
          <WalletBtnConnect walletAddress={walletAddress} setWalletAddress={setWalletAddress} walletAddressAnonymized={walletAddressAnonymized} setWalletAddressAnonymized={setWalletAddressAnonymized} />
          <Account isConsumer={isConsumer} setIsConsumer={setIsConsumer} isSeller={isSeller} setIsSeller={setIsSeller} walletAddress={walletAddress} walletAddressAnonymized={walletAddressAnonymized} />
          <AnonymePanel walletAddress={walletAddress} walletAddressAnonymized={walletAddressAnonymized} isConsumer={isConsumer} isSeller={isSeller} />
          <SellerPanel walletAddress={walletAddress} walletAddressAnonymized={walletAddressAnonymized} isSeller={isSeller} isConsumer={isConsumer} />
          <ConsumerPanel walletAddress={walletAddress} walletAddressAnonymized={walletAddressAnonymized} isConsumer={isConsumer} isSeller={isSeller} />
          {/*
          */}
        </div>
      </div>
    </EthProvider>
  );
}

export default App;
