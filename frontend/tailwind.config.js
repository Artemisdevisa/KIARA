/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  safelist: [
    { pattern: /^bg-bio-/ },
    { pattern: /^text-bio-/ },
    { pattern: /^border-bio-/ },
    { pattern: /^ring-bio-/ },
    { pattern: /^from-bio-/ },
    { pattern: /^to-bio-/ },
    { pattern: /^hover:bg-bio-/ },
    { pattern: /^hover:text-bio-/ },
    { pattern: /^hover:border-bio-/ },
    { pattern: /^fill-bio-/ },
    { pattern: /^stroke-bio-/ },
    { pattern: /^dark:/, variants: ['dark'] },
  ],
  theme: {
    extend: {
      colors: {
        bio: {
          dark:  '#1B4332',
          main:  '#2D6A4F',
          light: '#52B788',
          pale:  '#D8F3DC',
          earth: '#B7791F',
          cream: '#FAFAF7',
          ink:   '#1B1B1B',
          muted: '#6B7280',
        },
        primary: {
          50:  '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
        },
      },
      fontFamily: {
        sans: ['Nunito', 'system-ui', 'sans-serif'],
      },
      animation: {
        'bounce-slow': 'bounce 2s infinite',
      },
    },
  },
  plugins: [],
}
