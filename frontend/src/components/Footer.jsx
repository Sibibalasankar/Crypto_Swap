import React from 'react'
import { Github, Twitter, MessageCircle, BookOpen } from 'lucide-react'

function Footer() {
  return (
    <footer className="glass-card mx-4 mt-8">
      <div className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-xl font-bold gradient-text mb-4">Crypto_Swap</h3>
            <p className="text-gray-400">
              A bidirectional Automated Market Maker protocol built on Base Sepolia.
            </p>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Protocol</h4>
            <ul className="space-y-2 text-gray-400">
              <li><a href="#" className="hover:text-white transition-colors">Swap</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Liquidity</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Analytics</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Docs</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Community</h4>
            <ul className="space-y-2 text-gray-400">
              <li><a href="#" className="hover:text-white transition-colors">Twitter</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Discord</a></li>
              <li><a href="#" className="hover:text-white transition-colors">GitHub</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Developers</h4>
            <ul className="space-y-2 text-gray-400">
              <li><a href="#" className="hover:text-white transition-colors">Contracts</a></li>
              <li><a href="#" className="hover:text-white transition-colors">API</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Audits</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Bug Bounty</a></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-glass-border mt-8 pt-8">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="text-gray-400 text-sm mb-4 md:mb-0">
              © 2024 Crypto_Swap. All rights reserved. Running on Base Sepolia Testnet.
            </div>
            
            <div className="flex space-x-4">
              <a href="#" className="glass-card p-2 rounded-lg hover:scale-110 transition-transform">
                <Github className="w-5 h-5" />
              </a>
              <a href="#" className="glass-card p-2 rounded-lg hover:scale-110 transition-transform">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="glass-card p-2 rounded-lg hover:scale-110 transition-transform">
                <MessageCircle className="w-5 h-5" />
              </a>
              <a href="#" className="glass-card p-2 rounded-lg hover:scale-110 transition-transform">
                <BookOpen className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer