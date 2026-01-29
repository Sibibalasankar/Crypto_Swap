// BlockchainContext.jsx - PERFECT!
import React, { createContext, useContext, useMemo } from 'react';
import { useBlockchain } from '../hooks/useBlockchain';

const BlockchainContext = createContext(null);

export function BlockchainProvider({ children }) {
  const blockchain = useBlockchain();
  const contextValue = useMemo(() => blockchain, [blockchain]);

  return (
    <BlockchainContext.Provider value={contextValue}>
      {children}
    </BlockchainContext.Provider>
  );
}

export function useBlockchainContext() {
  const context = useContext(BlockchainContext);
  if (!context) {
    throw new Error('useBlockchainContext must be used within a BlockchainProvider');
  }
  return context;
}