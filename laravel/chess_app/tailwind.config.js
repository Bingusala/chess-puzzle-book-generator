/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './resources/**/*.{blade.php,js,jsx}',
  ],
  theme: {
    extend: {
      colors: {
        chess: {
          dark: '#1a1a2e',
          panel: '#16213e',
          card: '#0f3460',
          accent: '#e94560',
          light: '#f1f5f9',
        },
      },
    },
  },
  plugins: [],
}
