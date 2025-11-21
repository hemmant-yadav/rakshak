/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Poppins', 'system-ui', 'sans-serif'],
      },
      colors: {
        navy: {
          100: '#223052',
          200: '#17213a',
          500: '#12203a',
        },
        teal: {
          100: '#aff0e6',
          400: '#09babb',
          500: '#009e9e',
        },
        yellow: {
          100: '#fff9da',
          400: '#ffde59',
          500: '#ffe445',
        },
        charcoal: {
          100: '#232323',
          200: '#353942',
          900: '#101319',
        },
        primary: {
          DEFAULT: '#223052',
          light: '#354d7f',
          dark: '#12203a',
        },
        accent: {
          DEFAULT: '#ffde59',
        },
        success: {
          DEFAULT: '#24cf68',
        },
        error: {
          DEFAULT: '#ff5049',
        },
        white: '#fff',
        black: '#000',
        gray: {
          100: '#f6f8fa',
          400: '#bfc5d2',
          600: '#6b7280',
        },
        background: {
          light: '#f6f8fa',
          dark: '#101319',
        },
        highlight: {
          DEFAULT: '#09babb',
        },
        warning: {
          DEFAULT: '#ffe445',
        },
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
      boxShadow: {
        vivid: '0 0 18px 4px #09babb44',
        card: '0 4px 28px 0 rgba(34,48,82,0.11)',
      },
      backgroundImage: theme => ({
        'hero-gradient': 'linear-gradient(120deg,#223052 0%,#009e9e 65%,#ffde59 100%)',
        'card-glass': 'linear-gradient(120deg,rgba(34,48,82,0.97) 75%,rgba(255,255,255,0))',
      })
    },
  },
  plugins: [],
}

