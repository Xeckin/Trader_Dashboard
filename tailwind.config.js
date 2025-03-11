/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        cyber: {
          black: '#0D0D0D',
          pink: '#FF0033', // Changed from magenta to red
          blue: '#00FFFF',
          green: '#39FF14',
        },
      },
      animation: {
        'gradient': 'gradient 8s linear infinite',
        'glow': 'glow 2s ease-in-out infinite',
        'pulse': 'pulse 2s ease-in-out infinite',
        'scanline': 'scanline 8s linear infinite',
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
          },
        },
        glow: {
          '0%, 100%': {
            filter: 'drop-shadow(0 0 2px rgba(0, 255, 255, 0.8)) drop-shadow(0 0 5px rgba(0, 255, 255, 0.4))'
          },
          '50%': {
            filter: 'drop-shadow(0 0 5px rgba(0, 255, 255, 0.8)) drop-shadow(0 0 10px rgba(0, 255, 255, 0.4))'
          },
        },
        pulse: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.5' },
        },
        scanline: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100%)' },
        },
      },
      backgroundImage: {
        'cyber-grid': 'linear-gradient(rgba(57, 255, 20, 0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(57, 255, 20, 0.05) 1px, transparent 1px)',
      },
    },
  },
  plugins: [],
};