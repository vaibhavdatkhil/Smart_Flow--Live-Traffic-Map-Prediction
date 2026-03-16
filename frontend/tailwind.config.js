/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        city: {
          dark: '#030712',
          panel: '#0a0f1e',
          card: '#0d1424',
          border: '#1a2744',
          accent: '#00d4ff',
          green: '#00ff88',
          amber: '#ffb800',
          red: '#ff3b3b',
          purple: '#7c3aed',
        }
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
        display: ['Rajdhani', 'Bebas Neue', 'sans-serif'],
        body: ['Exo 2', 'DM Sans', 'sans-serif'],
      },
      animation: {
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
        'scan': 'scan 3s linear infinite',
        'float': 'float 3s ease-in-out infinite',
        'counter': 'counter 0.5s ease-out',
      },
      keyframes: {
        'pulse-glow': {
          '0%, 100%': { boxShadow: '0 0 5px #00d4ff, 0 0 10px #00d4ff' },
          '50%': { boxShadow: '0 0 20px #00d4ff, 0 0 40px #00d4ff' },
        },
        scan: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100%)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-6px)' },
        }
      }
    },
  },
  plugins: [],
}
