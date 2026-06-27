/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      spacing: {
        'safe-top': 'env(safe-area-inset-top)',
        'safe-bottom': 'env(safe-area-inset-bottom)',
        'safe-left': 'env(safe-area-inset-left)',
        'safe-right': 'env(safe-area-inset-right)',
      },
      colors: {
        forest: '#0A1F18',
        emerald: {
            dark: '#0D2B20',
            mid: '#1A4A38',
        },
        gold: '#C9A84C',
        cream: '#F5E6C8',
        sage: '#8FAF9A',
      },
      fontFamily: {
        display: ['"Playfair Display"', 'serif'],
        body: ['"Inter"', 'sans-serif'],
        urdu: ['"Noto Nastaliq Urdu"', 'serif'],
        arabicDisplay: ['"Amiri"', 'serif'],
      },
      transitionTimingFunction: {
        fluid: 'cubic-bezier(0.32, 0.72, 0, 1)',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0) scale(1)', opacity: 0.3 },
          '50%': { transform: 'translateY(-20px) scale(1.1)', opacity: 0.8 },
        },
        twinkle: {
          '0%, 100%': { opacity: 0.1 },
          '50%': { opacity: 0.7 },
        },
        'pulse-slow': {
          '0%, 100%': { opacity: 0.3 },
          '50%': { opacity: 0.6 },
        },
        pan: {
          '0%': { transform: 'translateX(-250px)' },
          '100%': { transform: 'translateX(120vw)' },
        },
        'landscape-rotate': {
          '0%, 20%': { transform: 'rotate(90deg)' },
          '50%, 70%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(90deg)' },
        }
      },
      animation: {
        'float': 'float 8s ease-in-out infinite',
        'twinkle': 'twinkle 4s ease-in-out infinite',
        'pulse-slow': 'pulse-slow 6s ease-in-out infinite',
        'pan-slow': 'pan 60s ease-in-out infinite alternate',
        'pan-slower': 'pan 100s ease-in-out infinite alternate',
        'landscape-rotate': 'landscape-rotate 3s cubic-bezier(0.32, 0.72, 0, 1) infinite',
      }
    },
  },
  plugins: [],
}
