import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { 
  Home, 
  RefreshCw,  // This is the swap icon in v0.263.1
  PieChart
} from 'lucide-react'
import Logo from '../assets/Logo.png' // Import your logo

function Navigation() {
  const location = useLocation()
  
  const navItems = [
    { path: '/', label: 'Dashboard', icon: Home },
    { path: '/swap', label: 'Swap', icon: RefreshCw },  // Changed to RefreshCw
    { path: '/liquidity', label: 'Liquidity', icon: PieChart },
  ]

  return (
    <nav className="glass-card mx-4 mt-4 mb-8">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo and Brand Section */}
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-xl overflow-hidden   shadow-lg">
              <img 
                src={Logo} 
                alt="Crypto_Swap Logo" 
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <h1 className="text-2xl font-bold gradient-text">Swap Saga</h1>
              <p className="text-sm text-gray-400">Bidirectional AMM on Base Sepolia</p>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="flex space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = location.pathname === item.path
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center space-x-2 px-6 py-3 rounded-xl transition-all duration-300 ${
                    isActive
                      ? 'gradient-bg text-white shadow-lg transform scale-105'
                      : 'text-gray-400 hover:text-white hover:bg-glass hover:scale-105'
                  }`}
                >
                  <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-gray-400 group-hover:text-white'}`} />
                  <span className="font-medium">{item.label}</span>
                </Link>
              )
            })}
          </div>

          {/* Network Status */}
          <div className="text-right">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-green-900/30 to-emerald-900/30 border border-emerald-500/30">
              <div className="w-2 h-2 bg-emerald-500 rounded-full mr-2 animate-pulse"></div>
              <span className="text-sm font-medium text-emerald-400">Testnet Live</span>
            </div>
            <p className="text-xs text-gray-500 mt-1">Base Sepolia</p>
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navigation