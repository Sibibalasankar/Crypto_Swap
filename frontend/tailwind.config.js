/** @type {import('tailwindcss').Config} */
export default {
    darkMode: ["class"],
    content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
  	extend: {
  		colors: {
  			'gradient-start': '#667eea',
  			'gradient-middle': '#764ba2',
  			'gradient-end': '#6B8DD6',
  			'dark-bg': '#0a0a0a',
  			'card-bg': 'rgba(20, 20, 30, 0.7)',
  			glass: 'rgba(255, 255, 255, 0.05)',
  			'glass-border': 'rgba(255, 255, 255, 0.1)',
  			background: 'hsl(var(--background))',
  			foreground: 'hsl(var(--foreground))',
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			primary: {
  				DEFAULT: 'hsl(var(--primary))',
  				foreground: 'hsl(var(--primary-foreground))'
  			},
  			secondary: {
  				DEFAULT: 'hsl(var(--secondary))',
  				foreground: 'hsl(var(--secondary-foreground))'
  			},
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			accent: {
  				DEFAULT: 'hsl(var(--accent))',
  				foreground: 'hsl(var(--accent-foreground))'
  			},
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))'
  			},
  			border: 'hsl(var(--border))',
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',
  			chart: {
  				'1': 'hsl(var(--chart-1))',
  				'2': 'hsl(var(--chart-2))',
  				'3': 'hsl(var(--chart-3))',
  				'4': 'hsl(var(--chart-4))',
  				'5': 'hsl(var(--chart-5))'
  			}
  		},
  		backdropBlur: {
  			xs: '2px'
  		},
  		animation: {
  			gradient: 'gradient 8s linear infinite',
  			float: 'float 25s ease-in-out infinite',
  			'float-delayed': 'float-delayed 30s ease-in-out infinite',
  			'pulse-slow': 'pulse-slow 15s ease-in-out infinite',
  			'pulse-glow': 'pulse-glow 2s ease-in-out infinite'
  		},
  		keyframes: {
  			gradient: {
  				'0%, 100%': {
  					'background-size': '200% 200%',
  					'background-position': 'left center'
  				},
  				'50%': {
  					'background-size': '200% 200%',
  					'background-position': 'right center'
  				}
  			},
  			float: {
  				'0%, 100%': {
  					transform: 'translate(0, 0) scale(1)',
  					opacity: '0.3'
  				},
  				'33%': {
  					transform: 'translate(50px, -50px) scale(1.1)',
  					opacity: '0.4'
  				},
  				'66%': {
  					transform: 'translate(-40px, 30px) scale(0.95)',
  					opacity: '0.25'
  				}
  			},
  			'float-delayed': {
  				'0%, 100%': {
  					transform: 'translate(0, 0) scale(1)',
  					opacity: '0.25'
  				},
  				'33%': {
  					transform: 'translate(-60px, 40px) scale(1.15)',
  					opacity: '0.35'
  				},
  				'66%': {
  					transform: 'translate(50px, -30px) scale(0.9)',
  					opacity: '0.2'
  				}
  			},
  			'pulse-slow': {
  				'0%, 100%': {
  					transform: 'scale(1)',
  					opacity: '0.15'
  				},
  				'50%': {
  					transform: 'scale(1.1)',
  					opacity: '0.25'
  				}
  			},
  			'pulse-glow': {
  				'0%, 100%': {
  					opacity: 1
  				},
  				'50%': {
  					opacity: 0.7
  				}
  			}
  		},
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		}
  	}
  },
  plugins: [require("tailwindcss-animate")],
}