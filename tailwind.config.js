/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#4285F4',
          light: '#E8F0FE',
          hover: '#1A73E8',
          bar: '#C5DAF6',
        },
        success: {
          DEFAULT: '#34A853',
          light: '#E6F4EA',
        },
        danger: {
          DEFAULT: '#EA4335',
          light: '#FCE8E6',
        },
        warning: {
          DEFAULT: '#F9AB00',
          light: '#FEF7E0',
        },
        gray: {
          100: '#F5F5F5',
          300: '#E0E0E0',
          500: '#888888',
          700: '#CCCCCC',
        },
      },
      fontFamily: {
        sans: ['Pretendard', '-apple-system', 'BlinkMacSystemFont', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
