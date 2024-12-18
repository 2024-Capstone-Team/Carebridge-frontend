module.exports = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontSize: {
        // title: '3.2rem',
        message: '1rem', // For messages
        time: '0.875rem', // For message timestamps
      },
      colors: {
        primary: '#646cff',  // Color (to be changed)
        secondary: '#535bf2',  // Secondary Color (to be changed)
      },
    },
  },
  plugins: [],
};
