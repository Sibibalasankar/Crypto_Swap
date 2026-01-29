import React from 'react'
import { ExternalLink, Code, FileText } from 'lucide-react'

function Footer() {
  // Real contract addresses (from your contracts)
  const contractAddresses = {
    tokenA: "0x1426DA8803cafC77c7B78329ED84d9477B380B6c",
    tokenB: "0x40616A3e2C3c6868F455d92919253Ec1d48A4fF8",
    swap: "0x71237162c8DB4b52135caa2B6A9993e7d72Bbf52"
  }

  // Real network information
  const networkInfo = {
    name: "Base Sepolia",
    chainId: 84532,
    explorer: "https://sepolia.basescan.org",
    faucet: "https://faucet.quicknode.com/base/sepolia"
  }

  return (
    <footer className="glass-card mx-4 mt-8 border-t border-white/10">
      <div className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Protocol Info */}
          <div>
            <h3 className="text-xl font-bold gradient-text mb-4">Crypto_Swap AMM</h3>
            <p className="text-gray-400 mb-4">
              Bidirectional Automated Market Maker deployed on Base Sepolia Testnet.
            </p>
            <div className="text-sm text-gray-500 space-y-1">
              <p>Chain: <span className="text-emerald-400">{networkInfo.name}</span></p>
              <p>Chain ID: <span className="text-emerald-400">{networkInfo.chainId}</span></p>
              <p>Version: <span className="text-emerald-400">1.0.0</span></p>
            </div>
          </div>
          
          {/* Contract Addresses */}
          <div>
            <h4 className="font-semibold mb-4 flex items-center">
              <Code className="w-4 h-4 mr-2" />
              Contract Addresses
            </h4>
            <ul className="space-y-3 text-gray-400">
              <li>
                <div className="text-xs text-gray-500">Token A (TKA)</div>
                <a 
                  href={`${networkInfo.explorer}/address/${contractAddresses.tokenA}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-mono hover:text-emerald-400 transition-colors flex items-center"
                >
                  {contractAddresses.tokenA.slice(0, 10)}...{contractAddresses.tokenA.slice(-8)}
                  <ExternalLink className="w-3 h-3 ml-1" />
                </a>
              </li>
              <li>
                <div className="text-xs text-gray-500">Token B (TKB)</div>
                <a 
                  href={`${networkInfo.explorer}/address/${contractAddresses.tokenB}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-mono hover:text-emerald-400 transition-colors flex items-center"
                >
                  {contractAddresses.tokenB.slice(0, 10)}...{contractAddresses.tokenB.slice(-8)}
                  <ExternalLink className="w-3 h-3 ml-1" />
                </a>
              </li>
              <li>
                <div className="text-xs text-gray-500">Swap Contract</div>
                <a 
                  href={`${networkInfo.explorer}/address/${contractAddresses.swap}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-mono hover:text-emerald-400 transition-colors flex items-center"
                >
                  {contractAddresses.swap.slice(0, 10)}...{contractAddresses.swap.slice(-8)}
                  <ExternalLink className="w-3 h-3 ml-1" />
                </a>
              </li>
            </ul>
          </div>
          
          {/* Useful Links */}
          <div>
            <h4 className="font-semibold mb-4 flex items-center">
              <FileText className="w-4 h-4 mr-2" />
              Quick Links
            </h4>
            <ul className="space-y-3 text-gray-400">
              <li>
                <a 
                  href={networkInfo.faucet}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-emerald-400 transition-colors flex items-center"
                >
                  <span className="mr-2">🪠</span>
                  Get Test ETH (Faucet)
                  <ExternalLink className="w-3 h-3 ml-1" />
                </a>
              </li>
              <li>
                <a 
                  href={networkInfo.explorer}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-emerald-400 transition-colors flex items-center"
                >
                  <span className="mr-2">🔍</span>
                  Base Sepolia Explorer
                  <ExternalLink className="w-3 h-3 ml-1" />
                </a>
              </li>
              <li>
                <a 
                  href="https://docs.base.org/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-emerald-400 transition-colors flex items-center"
                >
                  <span className="mr-2">📚</span>
                  Base Documentation
                  <ExternalLink className="w-3 h-3 ml-1" />
                </a>
              </li>
              <li>
                <a 
                  href="https://www.coinbase.com/developer-platform/base"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-emerald-400 transition-colors flex items-center"
                >
                  <span className="mr-2">🛠️</span>
                  Base Developer Platform
                  <ExternalLink className="w-3 h-3 ml-1" />
                </a>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-glass-border mt-8 pt-8">
          <div className="flex flex-col md:flex-row items-center justify-between">
            {/* Copyright and Network Status */}
            <div className="text-gray-400 text-sm">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                <span>© {new Date().getFullYear()} Crypto_Swap AMM • Running on {networkInfo.name} Testnet</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer