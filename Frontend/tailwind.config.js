/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        heading: ['Poppins', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      colors: {
        // Brand Cyan/Ocean — Premium Luxury accent
        brand: {
          50: '#ECFEFF',
          100: '#CFFAFE',
          200: '#A5F3FC',
          300: '#67E8F9',
          400: '#22D3EE',
          500: '#06B6D4',
          600: '#0891B2',
          700: '#0E7490',
          800: '#155E75',
          900: '#164E63',
        },
        // ocean.* — kept for backward compat with JSX, now maps to premium blue-green/cyan/sky
        ocean: {
          primary: '#06B6D4',
          secondary: '#0284C7',
          accent: '#0EA5E9',
          bg: '#FFFFFF',
          'bg-sec': '#FAFAFA',
          border: '#E2E8F0',
          'text-pri': '#0F172A',
          'text-sec': '#475569',
        },
        // midnight.* — Elegant charcoal/navy dark mode (not pure black)
        midnight: {
          bg: '#0F172A',
          secondary: '#1E293B',
          card: '#1E293B',
          border: '#334155',
          'accent-pri': '#06B6D4',
          'accent-sec': '#22D3EE',
          'text-pri': '#F8FAFC',
          'text-sec': '#94A3B8',
        },
      },
    },
  },
  plugins: [],
}