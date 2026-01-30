import React, { useState, useEffect } from 'react'
import { AlertCircle, CheckCircle } from 'lucide-react'
import { useBlockchainContext } from '../context/BlockchainContext'
import WalletConnect from './WalletConnect'

function NetworkStatus() {
  const { network, account } = useBlockchainContext()
  const [showSwitchNetwork, setShowSwitchNetwork] = useState(false)

  // Check if we're on the correct network
  const isCorrectNetwork = network?.chainId === BigInt(84532)

  // Only show if connected but wrong network
  const shouldShowWarning = account && network && !isCorrectNetwork

  // Network name mapping
  const getNetworkName = (chainId) => {
    switch (chainId?.toString()) {
      case '1': return 'Ethereum Mainnet'
      case '8453': return 'Base Mainnet'
      case '84532': return 'Base Sepolia'
      default: return `Chain ${chainId}`
    }
  }

  const switchToBaseSepolia = async () => {
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0x14a34' }] // Base Sepolia
      })
    } catch (error) {
      console.error('Error switching network:', error)

      // Chain not added to MetaMask
      if (error.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [{
              chainId: '0x14a34',
              chainName: 'Base Sepolia',
              nativeCurrency: {
                name: 'ETH',
                symbol: 'ETH',
                decimals: 18
              },
              rpcUrls: ['https://sepolia.base.org'],
              blockExplorerUrls: ['https://sepolia.basescan.org']
            }]
          })
        } catch (addError) {
          console.error('Error adding network:', addError)
          alert('Failed to add Base Sepolia network. Please add it manually in MetaMask.')
        }
      }
    }
  }

  // Don't show anything if not connected
  if (!account) return null

  return (
    <>
      {/* Network Status Indicator (Always shown when connected) */}
      {/* Network Status Indicator - Top Right */}
      {/* <div className="fixed top-4 right-4 z-50">
        <div className="flex items-center space-x-2 px-3 py-2 glass-card rounded-xl shadow-lg backdrop-blur-sm">
          <div className={`w-2 h-2 rounded-full ${isCorrectNetwork ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`}></div>
          <span className="text-sm font-medium">
            {isCorrectNetwork ? 'Base Sepolia' : getNetworkName(network?.chainId?.toString())}
          </span>
        </div>
      </div> */}

      {/* Network Warning Banner (Only shows for wrong network) */}
      {shouldShowWarning && (
        <div className="mx-4 mb-6 animate-fade-in">
          <div className="glass-card border-amber-500/30 bg-amber-900/20">
            <div className="px-6 py-4 flex items-center space-x-3">
              <AlertCircle className="w-6 h-6 text-amber-400 flex-shrink-0" />
              <div className="flex-1">
                <h3 className="font-semibold text-amber-300">Wrong Network</h3>
                <p className="text-sm text-amber-200/80">
                  Please switch to Base Sepolia (Chain ID: 84532) to use Swap Saga
                </p>
                <p className="text-xs text-amber-200/60 mt-1">
                  Current network: {getNetworkName(network?.chainId?.toString())} (Chain ID: {network?.chainId?.toString()})
                </p>
                <div className="flex space-x-3 mt-3">
                  <button
                    onClick={switchToBaseSepolia}
                    className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-sm font-medium transition-colors flex items-center space-x-2"
                  >
                    <span>Switch to Base Sepolia</span>
                  </button>
                  <button
                    onClick={() => setShowSwitchNetwork(!showSwitchNetwork)}
                    className="px-4 py-2 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 rounded-lg text-sm font-medium transition-colors"
                  >
                    {showSwitchNetwork ? 'Hide Details' : 'Show Details'}
                  </button>
                </div>

                {showSwitchNetwork && (
                  <div className="mt-3 p-3 bg-amber-900/30 rounded-lg border border-amber-500/20">
                    <p className="text-xs text-amber-200/80 mb-2">
                      Base Sepolia Network Details:
                    </p>
                    <div className="text-xs space-y-1 text-amber-200/60">
                      <p>Chain ID: 84532 (0x14a34)</p>
                      <p>RPC URL: https://sepolia.base.org</p>
                      <p>Currency: ETH</p>
                      <p>Block Explorer: https://sepolia.basescan.org</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}


    </>
  )
}

export default NetworkStatus