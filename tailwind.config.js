/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        matte: {
          DEFAULT: '#0D1117',
          surface: '#131820',
          elevated: '#19202B',
        },
        olive: {
          dark: '#1A241E',
          mid: '#233128',
          glow: '#2F4536',
          accent: '#4C6B57',
        },
        electric: {
          DEFAULT: '#3B82F6',
          glow: '#60A5FA',
          deep: '#1D4ED8',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      backgroundImage: {
        'radial-olive': 'radial-gradient(circle at 50% 0%, rgba(76, 107, 87, 0.32) 0%, rgba(26, 36, 30, 0.12) 45%, rgba(13, 17, 23, 0) 75%)',
        'radial-electric': 'radial-gradient(circle at 80% 15%, rgba(59, 130, 246, 0.28) 0%, rgba(13, 17, 23, 0) 60%)',
      }
    },
  },
  plugins: [],
}
