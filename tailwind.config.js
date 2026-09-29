/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f0fdf4',
          100: '#dcfce7',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          900: '#14532d',
          accent: '#00f2fe',
        },
        dark: {
          bg: '#0b0f19',
          card: '#111827',
          border: '#1f2937',
          hover: '#1f293d',
        }
      },
      animation: {
        'pulse-glow': 'pulseGlow 2s infinite',
        'scan-line': 'scanLine 3s linear infinite',
      },
      keyframes: {
        pulseGlow: {
          '0%, 100%': { opacity: '0.4', filter: 'drop-shadow(0 0 15px rgba(34, 197, 94, 0.4))' },
          '50%': { opacity: '0.9', filter: 'drop-shadow(0 0 25px rgba(34, 197, 94, 0.8))' },
        },
        scanLine: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(1000%)' }
        }
      }
    },
  },
  plugins: [],
}
