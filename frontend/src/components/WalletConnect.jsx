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
      setTimeout(() => setCopied(false), 1500)
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
        className="flex items-center space-x-2 px-4 py-2.5 bg-white/10 backdrop-blur-md border border-white/10 text-white rounded-lg font-medium hover:bg-white/15 transition-all duration-300 disabled:opacity-50"
      >
        {isLoading ? (
          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
        ) : (
          <Wallet className="w-5 h-5" />
        )}
        <span>{isLoading ? 'Connecting...' : 'Connect Wallet'}</span>
      </button>
    )
  }

  return (
    <div className="flex items-center space-x-2">
      <div className="flex items-center space-x-3 bg-white/5 backdrop-blur-md border border-white/10 rounded-lg px-4 py-2.5">
        <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
        <span className="font-mono text-sm text-white">
          {truncateAddress(account)}
        </span>
        <button
          onClick={handleCopy}
          className="p-1 hover:bg-white/10 rounded transition-colors"
          title="Copy address"
        >
          {copied ? (
            <Check className="w-4 h-4 text-emerald-400" />
          ) : (
            <Copy className="w-4 h-4 text-white/60 hover:text-white" />
          )}
        </button>
      </div>
      
      <button
        onClick={() => window.location.reload()}
        className="p-2.5 bg-white/5 backdrop-blur-md border border-white/10 hover:bg-red-500/20 hover:border-red-400/30 rounded-lg transition-all duration-300"
        title="Disconnect"
      >
        <LogOut className="w-5 h-5 text-white/60 hover:text-red-400 transition-colors" />
      </button>
    </div>
  )
}

export default WalletConnect