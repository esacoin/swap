// src/components/WalletConnect.js

import React, { useState, useEffect } from 'react';
import Web3Modal from 'web3modal';
import { ethers } from 'ethers';

const WalletConnect = ({ setProvider, setSigner, setAddress }) => {
  const [connected, setConnected] = useState(false);

  const connectWallet = async () => {
    try {
      const web3Modal = new Web3Modal({
        network: 'mainnet', // Change to 'esacoin' if supported
        cacheProvider: true,
      });

      const connection = await web3Modal.connect();
      const provider = new ethers.providers.Web3Provider(connection);
      const signer = provider.getSigner();
      const address = await signer.getAddress();

      setProvider(provider);
      setSigner(signer);
      setAddress(address);
      setConnected(true);

      // Subscribe to accounts change
      connection.on('accountsChanged', (accounts) => {
        window.location.reload();
      });

      // Subscribe to chainId change
      connection.on('chainChanged', (chainId) => {
        window.location.reload();
      });

      // Subscribe to networkId change
      connection.on('networkChanged', (networkId) => {
        window.location.reload();
      });
    } catch (error) {
      console.error('Wallet connection failed:', error);
    }
  };

  return (
    <div>
      {!connected ? (
        <button onClick={connectWallet}>Connect Wallet</button>
      ) : (
        <p>Connected</p>
      )}
    </div>
  );
};

export default WalletConnect;

