module.exports = {
  purge: ['./pages/**/*.{js,ts,jsx,tsx}', './components/**/*.{js,ts,jsx,tsx}'],
  darkMode: false, // or 'media' or 'class'
  theme: {
    extend: {
      spacing: {
        'lowest': '300px',
        '80px': '80px'
      },
      fontSize: {
        '10xl': '10rem',
        '11xl': '12rem'
      },
      keyframes: {
        wiggle: {
          '0%, 100%': { transform: 'rotate(-3deg)' },
          '50%': { transform: 'rotate(3deg)' },
        }
       },
       animation: {
        wiggle: 'wiggle 1s ease-in-out infinite',
       },
       screens: {
        'usm': '320px',
      },  
    },
  },
  variants: {
    extend: {},
  },
  plugins: [],
}