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
        className="flex items-center space-x-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
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
      <div className="flex items-center space-x-3 bg-gray-900 border border-gray-800 rounded-lg px-4 py-2.5">
        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
        <span className="font-mono text-sm text-gray-100">
          {truncateAddress(account)}
        </span>
        <button
          onClick={handleCopy}
          className="p-1 hover:bg-gray-800 rounded transition-colors"
          title="Copy address"
        >
          {copied ? (
            <Check className="w-4 h-4 text-green-400" />
          ) : (
            <Copy className="w-4 h-4 text-gray-400" />
          )}
        </button>
      </div>
      
      <button
        onClick={() => window.location.reload()}
        className="p-2.5 bg-gray-900 border border-gray-800 hover:bg-red-500/10 hover:border-red-500/30 rounded-lg transition-colors"
        title="Disconnect"
      >
        <LogOut className="w-5 h-5 text-gray-400 hover:text-red-400 transition-colors" />
      </button>
    </div>
  )
}

export default WalletConnect