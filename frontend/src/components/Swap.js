// src/components/Swap.js

import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { Token, Fetcher, Route, Trade, TokenAmount, TradeType, Percent } from '@uniswap/sdk';
import Web3Modal from 'web3modal';

const Swap = ({ provider, signer }) => {
  const [inputAmount, setInputAmount] = useState('');
  const [outputAmount, setOutputAmount] = useState('');
  const [tokenA, setTokenA] = useState(null);
  const [tokenB, setTokenB] = useState(null);
  const [trade, setTrade] = useState(null);

  useEffect(() => {
    const loadTokens = async () => {
      // Define your tokens
      const TTN = new Token(1, '0x6353d130520CC2b803F224Ad515A40Fa59e968F3', 18, 'TTN', 'TokenN');
      const TT2 = new Token(1, '0x5964c3B17dA46f239B305d559B2A4Ff2505F6928', 18, 'TT2', 'Token2');

      setTokenA(TTN);
      setTokenB(TT2);
    };

    loadTokens();
  }, []);

  const handleInputChange = async (e) => {
    const amount = e.target.value;
    setInputAmount(amount);

    if (tokenA && tokenB && amount) {
      try {
        const pair = await Fetcher.fetchPairData(tokenA, tokenB, provider);
        const route = new Route([pair], tokenA);
        const trade = new Trade(route, new TokenAmount(tokenA, ethers.utils.parseUnits(amount, 18).toString()), TradeType.EXACT_INPUT);

        setTrade(trade);
        setOutputAmount(trade.outputAmount.toSignificant(6));
      } catch (error) {
        console.error('Error fetching trade data:', error);
      }
    } else {
      setOutputAmount('');
    }
  };

  const executeSwap = async () => {
    if (!trade) {
      alert('No trade available');
      return;
    }

    const slippageTolerance = new Percent('50', '10000'); // 0.5%
    const amountOutMin = trade.minimumAmountOut(slippageTolerance).raw; // needs to be converted to hex
    const path = [tokenA.address, tokenB.address];
    const to = signer.address;
    const deadline = Math.floor(Date.now() / 1000) + 60 * 20; // 20 minutes from now

    // Define Uniswap Router Address and ABI
    const UNISWAP_ROUTER_ADDRESS = '0xYourUniswapRouterAddress'; // Replace with actual router address
    const UNISWAP_ROUTER_ABI = [
      'function swapExactTokensForTokens(uint amountIn, uint amountOutMin, address[] calldata path, address to, uint deadline) external returns (uint[] memory amounts)',
    ];

    const router = new ethers.Contract(UNISWAP_ROUTER_ADDRESS, UNISWAP_ROUTER_ABI, signer);

    // Approve tokenA
    const tokenAContract = new ethers.Contract(tokenA.address, ['function approve(address spender, uint amount) public returns(bool)'], signer);
    const txApprove = await tokenAContract.approve(UNISWAP_ROUTER_ADDRESS, ethers.constants.MaxUint256);
    await txApprove.wait();

    // Execute swap
    const amountIn = ethers.utils.parseUnits(inputAmount, 18);
    const tx = await router.swapExactTokensForTokens(
      amountIn,
      ethers.utils.parseUnits(trade.outputAmount.toSignificant(6), 18),
      path,
      to,
      deadline,
      {
        gasLimit: ethers.utils.hexlify(1000000),
      }
    );

    await tx.wait();
    alert('Swap executed successfully!');
  };

  return (
    <div>
      <h2>Swap Tokens</h2>
      <div>
        <input type="number" value={inputAmount} onChange={handleInputChange} placeholder="Amount to swap" />
      </div>
      <div>
        <p>Estimated Output: {outputAmount} {tokenB?.symbol}</p>
      </div>
      <button onClick={executeSwap}>Swap</button>
    </div>
  );
};

export default Swap;
