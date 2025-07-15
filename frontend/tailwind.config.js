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
      fontFamily: {
        'serif': ['Playfair Display', 'Georgia', 'serif'],
        'sans': ['Inter', 'system-ui', 'sans-serif'],
        'display': ['Cormorant Garamond', 'serif'],
        'body': ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        // Exact Sarcophagus Protocol brand colors from logo
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
        // Primary brand colors from logo - exact specifications
        primary: {
          blue: '#181C36',    // Navy Blue Background
          blueDark: '#0f111f',
        },
        // Gold gradient colors from logo
        accent: {
          gold: '#FFD700',        // Light Gold
          goldMedium: '#FFC14D',  // Medium Gold
          goldDark: '#B8860B',    // Deep Gold
        },
        // VeChain green
        vechain: {
          green: '#00b4b4',
          greenDark: '#009494',
        },
        // Text colors
        text: {
          primary: '#ffffff',
          secondary: '#e2e8f0',
          muted: '#94a3b8',
        }
      },
      backgroundImage: {
        'gold-gradient': 'linear-gradient(135deg, #FFD700 0%, #FFC14D 50%, #B8860B 100%)',
        'navy-gradient': 'linear-gradient(135deg, #181C36 0%, #0f111f 100%)',
      },
      boxShadow: {
        'sarcophagus': '0 4px 6px -1px rgba(24, 28, 54, 0.1), 0 2px 4px -1px rgba(24, 28, 54, 0.06)',
        'gold': '0 4px 6px -1px rgba(255, 215, 0, 0.1), 0 2px 4px -1px rgba(255, 215, 0, 0.06)',
        'goldDark': '0 4px 6px -1px rgba(184, 134, 11, 0.2), 0 2px 4px -1px rgba(184, 134, 11, 0.1)',
      },
    },
  },
  plugins: [],
} 