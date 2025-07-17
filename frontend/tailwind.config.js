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
        'heading': ['Poppins', 'Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        // Professional Sarcophagus Protocol brand colors
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
        // Refined primary brand colors
        primary: {
          blue: '#1a1a2e',    // Deep Navy Blue Background
          blueDark: '#0a0a11',
          blueLight: '#2d2d5a',
        },
        // Professional gold/amber palette
        accent: {
          gold: '#d4af37',        // Refined Gold
          goldLight: '#f4f4f4',   // Light Gold
          goldMedium: '#b8860b',  // Medium Gold
          goldDark: '#8b6914',    // Deep Gold
          amber: '#f39c12',     // Warm Amber
        },
        // Professional teal accent
        teal: {
          light: '#2d5a50',
          medium: '#1000a0',
          dark: '#0f111f',
        },
        // VeChain green (refined)
        vechain: {
          green: '#00b4b4',
          greenDark: '#949494',
          greenLight: '#00d4d4',
        },
        // Professional text colors
        text: {
          primary: '#f8f9fa',     // Soft White
          secondary: '#e9e9e9',   // Light Gray
          muted: '#adb5bd',       // Muted Gray
          accent: '#d4af37',      // Gold Text
        },
        // Professional background colors
        background: {
          primary: '#1a1a2e',
          secondary: '#0a0a11',
          card: 'rgba(26, 26, 46, 0.9)',
          overlay: 'rgba(15, 15, 17, 0.8)',
        },
      },
      backgroundImage: {
        'gold-gradient': 'linear-gradient(135deg, #d4af37 0%, #b8860b 50%, #8b6914 100%)',
        'navy-gradient': 'linear-gradient(135deg, #1a1a2e 0%, #0f0f11 100%)',
        'teal-gradient': 'linear-gradient(135deg, #2d5a50 0%, #1e3100 100%)',
      },
      boxShadow: {
        'sarcophagus': '0 4px 6px -1px rgba(26, 26, 46, 0.1), 0 2px 4px -1px rgba(26, 26, 46, 0.06)',
        'gold': '0 4px 6px -1px rgba(212, 175, 55, 0.1), 0 2px 4px -1px rgba(212, 175, 55, 0.06)',
        'goldDark': '0 4px 6px -1px rgba(139, 105, 20, 0.2), 0 2px 4px -1px rgba(139, 105, 20, 0.1)',
        'teal': '0 4px 6px -1px rgba(45, 90, 90, 0.1), 0 2px 4px -1px rgba(45, 90, 90, 0.06)',
      },
      fontSize: {
        'xs': ['0.75rem', { lineHeight: '1rem' }],
        'sm': ['0.875rem', { lineHeight: '1.25rem' }],
        'base': ['1rem', { lineHeight: '1.5rem' }],
        'lg': ['1.125rem', { lineHeight: '1.75rem' }],
        'xl': ['1.25rem', { lineHeight: '1.75rem' }],
        '2xl': ['1.5rem', { lineHeight: '2rem' }],
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
        '4xl': ['2.25rem', { lineHeight: '2.75rem' }],
        '5xl': ['2.5rem', { lineHeight: '1' }],
        '6xl': ['3.75rem', { lineHeight: '1' }],
      },
    },
  },
  plugins: [],
} 