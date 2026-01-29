import { useState, useCallback, useEffect } from 'react';
import { ethers } from 'ethers';
import { TOKEN_ABI, SWAP_ABI, CONTRACT_ADDRESSES } from '../utils/contracts';

export function useBlockchain() {
  // State variables
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [account, setAccount] = useState(null);
  const [network, setNetwork] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [txLoading, setTxLoading] = useState(false);
  
  // Token balances
  const [balances, setBalances] = useState({
    tokenA: '0',
    tokenB: '0',
    eth: '0'
  });
  
  // Pool data
  const [reserves, setReserves] = useState({
    reserveA: '0',
    reserveB: '0'
  });

  // Ownership state
  const [ownership, setOwnership] = useState({
    isOwner: false,
    tokenAOwner: null,
    tokenBOwner: null
  });
  
  // Contract instances
  const [contracts, setContracts] = useState({
    tokenA: null,
    tokenB: null,
    swap: null
  });

  // Initialize blockchain connection
  const initBlockchain = useCallback(async () => {
    try {
      setIsLoading(true);
      
      if (!window.ethereum) {
        throw new Error('Please install MetaMask!');
      }
      
      const web3Provider = new ethers.BrowserProvider(window.ethereum);
      const web3Signer = await web3Provider.getSigner();
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      const networkInfo = await web3Provider.getNetwork();
      
      setProvider(web3Provider);
      setSigner(web3Signer);
      setAccount(accounts[0]);
      setNetwork(networkInfo);
      
      // Initialize contracts with your ABIs
      const tokenAContract = new ethers.Contract(
        CONTRACT_ADDRESSES.tokenA,
        TOKEN_ABI,
        web3Signer
      );
      
      const tokenBContract = new ethers.Contract(
        CONTRACT_ADDRESSES.tokenB,
        TOKEN_ABI,
        web3Signer
      );
      
      const swapContract = new ethers.Contract(
        CONTRACT_ADDRESSES.swap,
        SWAP_ABI,
        web3Signer
      );
      
      setContracts({
        tokenA: tokenAContract,
        tokenB: tokenBContract,
        swap: swapContract
      });
      
      setIsInitialized(true);
      console.log('✅ Contracts initialized:', {
        tokenA: CONTRACT_ADDRESSES.tokenA,
        tokenB: CONTRACT_ADDRESSES.tokenB,
        swap: CONTRACT_ADDRESSES.swap
      });
      
    } catch (err) {
      console.error('Error initializing blockchain:', err);
      setIsInitialized(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Check token ownership
  const checkTokenOwnership = useCallback(async () => {
    if (!contracts.tokenA || !contracts.tokenB || !account) {
      return { isOwner: false, tokenAOwner: null, tokenBOwner: null };
    }
    
    try {
      const [ownerA, ownerB] = await Promise.all([
        contracts.tokenA.owner(),
        contracts.tokenB.owner()
      ]);
      
      const isOwner = ownerA.toLowerCase() === account.toLowerCase() && 
                      ownerB.toLowerCase() === account.toLowerCase();
      
      console.log('👑 Token Ownership:', {
        tokenAOwner: ownerA,
        tokenBOwner: ownerB,
        currentAccount: account,
        isOwner
      });
      
      setOwnership({ isOwner, tokenAOwner: ownerA, tokenBOwner: ownerB });
      
      return { isOwner, tokenAOwner: ownerA, tokenBOwner: ownerB };
      
    } catch (err) {
      console.error('Error checking ownership:', err);
      return { isOwner: false, tokenAOwner: null, tokenBOwner: null };
    }
  }, [account, contracts]);

  // Load all data (including ownership)
  const loadAllData = useCallback(async () => {
    if (!account || !contracts.tokenA || !contracts.tokenB || !contracts.swap) {
      return;
    }
    
    try {
      setIsLoading(true);
      
      // Load token balances
      const [balanceA, balanceB, ethBalance] = await Promise.all([
        contracts.tokenA.balanceOf(account),
        contracts.tokenB.balanceOf(account),
        provider.getBalance(account)
      ]);
      
      setBalances({
        tokenA: ethers.formatUnits(balanceA, 18),
        tokenB: ethers.formatUnits(balanceB, 18),
        eth: ethers.formatEther(ethBalance)
      });
      
      // Load pool reserves
      const [reserveA, reserveB] = await Promise.all([
        contracts.swap.reserveA(),
        contracts.swap.reserveB()
      ]);
      
      setReserves({
        reserveA: ethers.formatUnits(reserveA, 18),
        reserveB: ethers.formatUnits(reserveB, 18)
      });
      
      // Check ownership
      await checkTokenOwnership();
      
      console.log('📊 Data loaded:', {
        account,
        balances: { 
          tokenA: ethers.formatUnits(balanceA, 18), 
          tokenB: ethers.formatUnits(balanceB, 18) 
        },
        reserves: { 
          reserveA: ethers.formatUnits(reserveA, 18), 
          reserveB: ethers.formatUnits(reserveB, 18) 
        }
      });
      
    } catch (err) {
      console.error('Error loading data:', err);
    } finally {
      setIsLoading(false);
    }
  }, [account, provider, contracts, checkTokenOwnership]);

  // Mint tokens function - UPDATED WITH OWNERSHIP CHECK
  const mintTokens = useCallback(async (token, amount) => {
    if (!account || !contracts.tokenA || !contracts.tokenB) {
      throw new Error('Wallet not connected');
    }
    
    try {
      setTxLoading(true);
      const amountWei = ethers.parseUnits(amount, 18);
      
      console.log(`🔧 Attempting to mint ${amount} ${token} to ${account}`);
      
      // Check ownership first
      const { isOwner, tokenAOwner, tokenBOwner } = await checkTokenOwnership();
      
      if (!isOwner) {
        throw new Error(
          `🚫 Only the contract owner can mint tokens!\n\n` +
          `TokenA Owner: ${tokenAOwner}\n` +
          `TokenB Owner: ${tokenBOwner}\n` +
          `Your Address: ${account}\n\n` +
          `🔑 You need to be the owner to mint.\n` +
          `💡 Options:\n` +
          `1. Ask the owner (${tokenAOwner}) to mint tokens for you\n` +
          `2. Ask the owner to transfer ownership to you\n` +
          `3. Deploy new token contracts without Ownable restriction`
        );
      }
      
      let contract;
      let contractName;
      
      if (token === 'TKA') {
        contract = contracts.tokenA;
        contractName = 'TokenA';
      } else if (token === 'TKB') {
        contract = contracts.tokenB;
        contractName = 'TokenB';
      } else {
        throw new Error('Invalid token');
      }
      
      console.log(`🏗️ Using ${contractName} contract`);
      
      // Try to estimate gas first
      try {
        const gasEstimate = await contract.mint.estimateGas(account, amountWei);
        console.log(`⛽ Gas estimate: ${gasEstimate}`);
      } catch (estimateError) {
        console.error('❌ Gas estimation failed:', estimateError);
        throw new Error(`Cannot mint ${token}: ${estimateError.reason || estimateError.message}`);
      }
      
      // Execute the mint transaction
      const tx = await contract.mint(account, amountWei);
      console.log(`📤 Transaction sent: ${tx.hash}`);
      
      const receipt = await tx.wait();
      console.log(`✅ Transaction confirmed in block ${receipt.blockNumber}`);
      
      await loadAllData();
      return tx;
      
    } catch (err) {
      console.error(`❌ Error minting ${token}:`, err);
      
      let errorMessage = err.message || 'Unknown error';
      
      // Provide helpful error messages
      if (err.code === 'CALL_EXCEPTION') {
        errorMessage = 'Transaction failed. You may not be the contract owner.';
      } else if (err.code === 'ACTION_REJECTED') {
        errorMessage = 'Transaction rejected by user.';
      } else if (err.reason) {
        errorMessage = err.reason;
      }
      
      throw new Error(`Failed to mint ${token}: ${errorMessage}`);
    } finally {
      setTxLoading(false);
    }
  }, [account, contracts, loadAllData, checkTokenOwnership]);

  // Transfer ownership to current account
  const claimTokenOwnership = useCallback(async () => {
    if (!account || !contracts.tokenA || !contracts.tokenB) {
      throw new Error('Wallet not connected');
    }
    
    try {
      setTxLoading(true);
      
      // Check current owners
      const { tokenAOwner, tokenBOwner } = await checkTokenOwnership();
      
      console.log('Current owners:', { tokenAOwner, tokenBOwner });
      
      // Create a detailed message
      const message = 
        `📋 **Ownership Information**\n\n` +
        `Current TokenA Owner: ${tokenAOwner}\n` +
        `Current TokenB Owner: ${tokenBOwner}\n` +
        `Your Address: ${account}\n\n` +
        `🔑 **To become the owner:**\n\n` +
        `1. If you're the current owner, nothing needs to be done.\n` +
        `2. If you're NOT the owner, the current owner needs to run:\n\n` +
        `**Hardhat Console Commands:**\n` +
        `\`\`\`javascript\n` +
        `// For TokenA\n` +
        `const tokenA = await ethers.getContractAt("TokenA", "${CONTRACT_ADDRESSES.tokenA}")\n` +
        `await tokenA.transferOwnership("${account}")\n` +
        `\n` +
        `// For TokenB\n` +
        `const tokenB = await ethers.getContractAt("TokenB", "${CONTRACT_ADDRESSES.tokenB}")\n` +
        `await tokenB.transferOwnership("${account}")\n` +
        `\`\`\`\n\n` +
        `📞 Contact the current owner at:\n${tokenAOwner}`;
      
      alert(message);
      
      return false;
      
    } catch (err) {
      console.error('Error claiming ownership:', err);
      throw err;
    } finally {
      setTxLoading(false);
    }
  }, [account, contracts, checkTokenOwnership]);

  // Swap tokens function
  const swapTokens = useCallback(async (fromToken, amount) => {
    if (!account || !contracts.swap) {
      throw new Error('Wallet not connected');
    }
    
    try {
      setTxLoading(true);
      const amountWei = ethers.parseUnits(amount, 18);
      
      let tx;
      if (fromToken === 'TKA') {
        // Approve TKA first
        const approveTx = await contracts.tokenA.approve(CONTRACT_ADDRESSES.swap, amountWei);
        await approveTx.wait();
        
        // Then swap TKA for TKB
        tx = await contracts.swap.swapAforB(amountWei);
      } else if (fromToken === 'TKB') {
        // Approve TKB first
        const approveTx = await contracts.tokenB.approve(CONTRACT_ADDRESSES.swap, amountWei);
        await approveTx.wait();
        
        // Then swap TKB for TKA
        tx = await contracts.swap.swapBforA(amountWei);
      } else {
        throw new Error('Invalid token');
      }
      
      await tx.wait();
      await loadAllData();
      return tx;
      
    } catch (err) {
      console.error(`Error swapping ${fromToken}:`, err);
      throw err;
    } finally {
      setTxLoading(false);
    }
  }, [account, contracts, loadAllData]);

  // Get swap amount out
  const getSwapAmountOut = useCallback(async (fromToken, amount) => {
    if (!contracts.swap) {
      return '0';
    }
    
    try {
      const amountWei = ethers.parseUnits(amount, 18);
      
      // Get current reserves
      const [reserveA, reserveB] = await Promise.all([
        contracts.swap.reserveA(),
        contracts.swap.reserveB()
      ]);
      
      let amountOut;
      if (fromToken === 'TKA') {
        // TKA → TKB
        amountOut = await contracts.swap.getAmountOut(amountWei, reserveA, reserveB);
      } else if (fromToken === 'TKB') {
        // TKB → TKA
        amountOut = await contracts.swap.getAmountOut(amountWei, reserveB, reserveA);
      } else {
        return '0';
      }
      
      return ethers.formatUnits(amountOut, 18);
      
    } catch (err) {
      console.error(`Error calculating swap amount for ${fromToken}:`, err);
      return '0';
    }
  }, [contracts.swap]);

  // Add liquidity function
  const addLiquidity = useCallback(async (amountA, amountB) => {
    if (!account || !contracts.swap || !contracts.tokenA || !contracts.tokenB) {
      throw new Error('Wallet not connected');
    }
    
    try {
      setTxLoading(true);
      const amountAWei = ethers.parseUnits(amountA, 18);
      const amountBWei = ethers.parseUnits(amountB, 18);
      
      // Approve both tokens
      const approveATx = await contracts.tokenA.approve(CONTRACT_ADDRESSES.swap, amountAWei);
      const approveBTx = await contracts.tokenB.approve(CONTRACT_ADDRESSES.swap, amountBWei);
      
      await Promise.all([approveATx.wait(), approveBTx.wait()]);
      
      // Add liquidity
      const tx = await contracts.swap.addLiquidity(amountAWei, amountBWei);
      await tx.wait();
      
      await loadAllData();
      return tx;
      
    } catch (err) {
      console.error('Error adding liquidity:', err);
      throw err;
    } finally {
      setTxLoading(false);
    }
  }, [account, contracts, loadAllData]);

  // Refresh data function
  const refreshData = useCallback(async () => {
    await loadAllData();
  }, [loadAllData]);

  // Listen for account changes
  useEffect(() => {
    if (!window.ethereum) return;
    
    const handleAccountsChanged = (accounts) => {
      if (accounts.length === 0) {
        // User disconnected
        setAccount(null);
        setBalances({ tokenA: '0', tokenB: '0', eth: '0' });
        setReserves({ reserveA: '0', reserveB: '0' });
        setOwnership({ isOwner: false, tokenAOwner: null, tokenBOwner: null });
      } else if (accounts[0] !== account) {
        setAccount(accounts[0]);
      }
    };
    
    const handleChainChanged = () => {
      window.location.reload();
    };
    
    window.ethereum.on('accountsChanged', handleAccountsChanged);
    window.ethereum.on('chainChanged', handleChainChanged);
    
    return () => {
      window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
      window.ethereum.removeListener('chainChanged', handleChainChanged);
    };
  }, [account]);

  // Initialize and load data when account or contracts change
  useEffect(() => {
    if (!isInitialized) {
      initBlockchain();
    }
  }, [isInitialized, initBlockchain]);

  useEffect(() => {
    if (isInitialized && account && contracts.tokenA) {
      loadAllData();
    }
  }, [isInitialized, account, contracts.tokenA, loadAllData]);

  return {
    // State
    provider,
    signer,
    account,
    network,
    balances,
    reserves,
    ownership,
    contracts,
    isInitialized,
    isLoading,
    txLoading,
    
    // Methods
    initBlockchain,
    loadAllData,
    refreshData,
    mintTokens,
    swapTokens,
    getSwapAmountOut,
    addLiquidity,
    checkTokenOwnership,
    claimTokenOwnership,
    
    // Alias for convenience
    connectWallet: initBlockchain,
  };
}