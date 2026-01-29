import React, { useState } from 'react'
import { Wallet, LogOut, Copy, Check } from 'lucide-react'
import { useBlockchainContext } from '../context/BlockchainContext'

function WalletConnect() {
  const { account, connectWallet, isLoading } = useBlockchainContext()
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    if (account) {
      navigator.clipboard.writeText(account)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const truncateAddress = (addr) => {
    if (!addr) return ''
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`
  }

  if (!account) {
    return (
      <button
        onClick={connectWallet}
        disabled={isLoading}
        className="group relative overflow-hidden px-6 py-3 gradient-bg rounded-xl font-semibold text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <span className="flex items-center space-x-2">
          {isLoading ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <Wallet className="w-5 h-5" />
          )}
          <span>{isLoading ? 'Connecting...' : 'Connect Wallet'}</span>
        </span>
        <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
      </button>
    )
  }

  return (
    <div className="flex items-center space-x-3">
      <div className="glass-card px-4 py-2 min-w-44">
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
          <span className="text-sm text-gray-300">Connected</span>
        </div>
        <div className="flex items-center space-x-2 mt-1">
          <span className="text-sm font-mono">{truncateAddress(account)}</span>
          <button
            onClick={handleCopy}
            className="p-1 hover:bg-glass rounded transition-colors"
            title="Copy address"
            disabled={!account}
          >
            {copied ? (
              <Check className="w-4 h-4 text-green-400" />
            ) : (
              <Copy className="w-4 h-4 text-gray-400" />
            )}
          </button>
        </div>
      </div>
      
      <button
        onClick={() => {
          // Note: In a real dApp, you can't programmatically disconnect MetaMask
          // This will just refresh the page to clear local state
          window.location.reload()
        }}
        className="glass-card px-4 py-3 hover:bg-red-500/10 hover:border-red-500/30 transition-all group disabled:opacity-50"
        title="Disconnect wallet"
      >
        <LogOut className="w-5 h-5 text-gray-400 group-hover:text-red-400 transition-colors" />
      </button>
    </div>
  )
}

export default WalletConnect