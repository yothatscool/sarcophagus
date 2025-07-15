/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Sarcophagus Protocol brand colors from logo
        sarcophagus: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
          950: '#020617',
        },
        // Primary brand colors from logo
        primary: {
          blue: '#1a365d',    // Deep navy blue from logo background
          gold: '#d69e2e',    // Bright gold from logo elements
          goldDark: '#b7791f', // Deeper burnished gold
          white: '#ffffff',   // Pure white text
          black: '#000000',   // Dark accent
        },
        // VeChain integration color
        vechain: {
          green: '#00b4b4',   // VeChain brand green
          dark: '#1a1a1a',    // VeChain dark
        },
        // Professional accent colors
        accent: {
          gold: '#d69e2e',    // Primary gold
          goldLight: '#f6ad55', // Light gold
          goldDark: '#b7791f',  // Dark gold
          blue: '#1a365d',    // Primary blue
          blueLight: '#2d5a87', // Light blue
          blueDark: '#0f1f2e',  // Dark blue
        }
      },
      fontFamily: {
        'serif': ['Georgia', 'serif'],
        'mono': ['Courier New', 'monospace'],
        'sans': ['Inter', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'temple-pattern': "url('data:image/svg+xml,%3Csvg width=\"60\" height=\"60\" viewBox=\"0 0 60 60\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cg fill=\"none\" fill-rule=\"evenodd\"%3E%3Cg fill=\"%23d69e2e\" fill-opacity=\"0.05\"%3E%3Cpath d=\"M30 10 L50 20 L50 40 L30 50 L10 40 L10 20 Z\"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')",
        'shield-pattern': "url('data:image/svg+xml,%3Csvg width=\"40\" height=\"40\" viewBox=\"0 0 40 40\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cg fill=\"none\" fill-rule=\"evenodd\"%3E%3Cg fill=\"%23d69e2e\" fill-opacity=\"0.03\"%3E%3Cpath d=\"M20 5 L35 10 L35 25 L20 35 L5 25 L5 10 Z\"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')",
      },
      boxShadow: {
        'sarcophagus': '0 4px 6px -1px rgba(26, 54, 93, 0.3), 0 2px 4px -1px rgba(26, 54, 93, 0.2)',
        'sarcophagus-lg': '0 10px 15px -3px rgba(26, 54, 93, 0.4), 0 4px 6px -2px rgba(26, 54, 93, 0.3)',
        'gold': '0 4px 6px -1px rgba(214, 158, 46, 0.3), 0 2px 4px -1px rgba(214, 158, 46, 0.2)',
        'gold-lg': '0 10px 15px -3px rgba(214, 158, 46, 0.4), 0 4px 6px -2px rgba(214, 158, 46, 0.3)',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'gold-glow': 'goldGlow 2s ease-in-out infinite alternate',
        'temple-shine': 'templeShine 3s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        goldGlow: {
          '0%': { boxShadow: '0 0 5px rgba(214, 158, 46, 0.3)' },
          '100%': { boxShadow: '0 0 20px rgba(214, 158, 46, 0.6)' },
        },
        templeShine: {
          '0%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
          '100%': { backgroundPosition: '0% 50%' },
        },
      },
    },
  },
  plugins: [],
} 