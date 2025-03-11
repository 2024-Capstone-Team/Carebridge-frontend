export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontSize: {
        // title: '3.2rem',
        message: '1rem', // For messages
        time: '0.875rem', // For message timestamps
      },
      colors: {
        primary: {
          DEFAULT: '#6990B6',  
          50: '#F0F4FA',
          100: '#DFE6EC',
          200: '#98B3C8',
          300: '#6990B6',
          400: '#226193',
        },
        secondary: '#535bf2', 
      },
    },
  },
  plugins: [
    // require('tailwind-scrollbar-hide'),
    require('tailwind-scrollbar'),
  ],
};
