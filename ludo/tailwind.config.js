/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        display: ['Orbitron', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
        accent: ['Rajdhani', 'sans-serif'],
      },
      colors: {
        primary: {
          50: '#f0f4ff',
          100: '#e0e9ff',
          200: '#c7d7fe',
          300: '#a5b9fc',
          400: '#818cf8',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca',
          800: '#3730a3',
          900: '#312e81',
          950: '#1e1b4b',
        },
        gold: {
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
        },
        player: {
          red: '#ef4444',
          blue: '#3b82f6',
          green: '#22c55e',
          yellow: '#eab308',
        }
      },
      backgroundImage: {
        'game-gradient': 'linear-gradient(135deg, #0f0c29, #302b63, #24243e)',
        'glass-gradient': 'linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05))',
        'gold-gradient': 'linear-gradient(135deg, #f59e0b, #fbbf24, #fcd34d)',
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
        'spin-slow': 'spin 8s linear infinite',
        'bounce-soft': 'bounceSoft 1s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
        'particle': 'particle 3s ease-out forwards',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(99, 102, 241, 0.4)' },
          '50%': { boxShadow: '0 0 40px rgba(99, 102, 241, 0.8), 0 0 80px rgba(99, 102, 241, 0.3)' },
        },
        bounceSoft: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        particle: {
          '0%': { opacity: '1', transform: 'scale(1) translateY(0)' },
          '100%': { opacity: '0', transform: 'scale(0) translateY(-100px)' },
        }
      },
      backdropBlur: {
        xs: '2px',
      }
    },
  },
  plugins: [],
}
