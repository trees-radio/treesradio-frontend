/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
      "./src/**/*.{js,jsx,ts,tsx}",
      "./public/index.html",
    ],
    theme: {
      extend: {
        keyframes: {
          'smoke-1': {
            '0%': { transform: 'scale(1) translate(0, 0)', opacity: '0.4' },
            '100%': { transform: 'scale(4) translate(10px, -50px)', opacity: '0' }
          },
          'smoke-2': {
            '0%': { transform: 'scale(1) translate(0, 0)', opacity: '0.4' },
            '100%': { transform: 'scale(3.5) translate(-15px, -40px)', opacity: '0' }
          },
          'smoke-3': {
            '0%': { transform: 'scale(1) translate(0, 0)', opacity: '0.4' },
            '100%': { transform: 'scale(3) translate(5px, -60px)', opacity: '0' }
          },
          'smoke-cloud': {
            '0%': { opacity: '0' },
            '20%': { opacity: '0.8' },
            '80%': { opacity: '0.6' },
            '100%': { opacity: '0' }
          }
        },
        animation: {
          'smoke-1': 'smoke-1 3s ease-out forwards',
          'smoke-2': 'smoke-2 3.5s ease-out forwards',
          'smoke-3': 'smoke-3 4s ease-out forwards',
          'smoke-cloud': 'smoke-cloud 6s ease-in-out forwards'
        },
      },
    },
    plugins: [],
  };
  