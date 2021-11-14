module.exports = {
  purge: ['./pages/**/*.{js,ts,jsx,tsx}', './components/**/*.{js,ts,jsx,tsx}'],
  darkMode: false, // or 'media' or 'class'
  theme: {
    extend: {
      spacing: {
        'lowest': '300px',
        '80px': '80px'
      }
    },
  },
  variants: {
    extend: {},
  },
  plugins: [],
}