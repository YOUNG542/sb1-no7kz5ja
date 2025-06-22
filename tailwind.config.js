/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      animation: {
        auraOne: 'auraOne 12s ease-in-out infinite',
        auraTwo: 'auraTwo 16s ease-in-out infinite',
      },
      keyframes: {
        auraOne: {
          '0%, 100%': { transform: 'translate(0, 0) scale(1)' },
          '50%': { transform: 'translate(30px, 50px) scale(1.2)' },
        },
        auraTwo: {
          '0%, 100%': { transform: 'translate(0, 0) scale(1)' },
          '50%': { transform: 'translate(-40px, -30px) scale(1.1)' },
        },
      },
    },
  },
  plugins: [],
};
