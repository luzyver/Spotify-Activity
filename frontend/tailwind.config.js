/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{html,js,svelte,ts}'],
  theme: {
    extend: {
      colors: {
        spotify: {
          green: '#1db954',
          light: '#1ed760',
          dark: '#1aa34a',
        },
      },
    },
  },
  plugins: [],
};
