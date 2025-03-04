/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
      "./src/**/*.{js,jsx,ts,tsx}",
      "./public/index.html",
    ],
    theme: {
      extend: {
        // Custom animations for smoke effects
        animation: {
          'smoke-1': 'float 5s ease-out forwards 0.2s',
          'smoke-2': 'float 5s ease-out forwards 0.5s',
          'smoke-3': 'float 5s ease-out forwards 0.8s',
        },
        keyframes: {
          float: {
            '0%': { transform: 'translateY(0) scale(1)', opacity: '0.8' },
            '100%': { transform: 'translateY(-100px) scale(3)', opacity: '0' },
          },
        },
        transitionProperty: {
          'width': 'width',
        },
      },
    },
    plugins: [],
  };
  