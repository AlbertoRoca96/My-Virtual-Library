/** @type {import('tailwindcss').Config} */
module.exports = {
  presets: [require('nativewind/preset')],
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}', './features/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        parchment: '#F5F0E8',
        paper: '#EFE7DB',
        ink: '#3F3A37',
        mist: '#7A726A',
        accent: '#8B6B4A',
        line: '#D9CFC1',
        night: '#241E1B',
      },
      fontFamily: {
        serif: ['Georgia'],
        sans: ['System'],
      },
      boxShadow: {
        card: '0 8px 24px rgba(63, 58, 55, 0.08)',
      },
    },
  },
  plugins: [],
};
