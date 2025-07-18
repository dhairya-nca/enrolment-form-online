/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        nca: {
          // Primary teal/green from the logo
          primary: '#1A7B76',
          secondary: '#148B7F', 
          light: '#E6F7F6',
          dark: '#0F5A56',
          accent: '#23A89A',
          // Supporting colors that work well with the teal
          gray: {
            50: '#F8FAFA',
            100: '#F1F5F5',
            200: '#E4ECEC',
            300: '#CBD5D5',
            400: '#9CAFAF',
            500: '#6B8080',
            600: '#4A5C5C',
            700: '#374545',
            800: '#2A3333',
            900: '#1E2626'
          }
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
      }
    },
  },
  plugins: [require('@tailwindcss/forms')],
}