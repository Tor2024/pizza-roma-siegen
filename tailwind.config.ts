import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'roma-red': '#C62828',
        'roma-gold': '#FFB300',
        'roma-dark': '#121212',
        'roma-light': '#FFFFFF',
        'roma-gray': '#F5F5F5',
        'roma-text': '#1A1A1A',
      },
      fontFamily: {
        poppins: ['Poppins', 'sans-serif'],
        inter: ['Inter', 'sans-serif'],
      },
      backgroundImage: {
        'hero-pattern': "url('/images/hero-bg.webp')",
      },
    },
  },
  plugins: [],
}
export default config
