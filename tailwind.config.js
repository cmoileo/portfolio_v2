/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#FAFAFA',
        ink: '#111111',
        accent: '#C8060F',
      },
      fontFamily: {
        display: ['"Editorial New"', '"Editorial Fallback"', 'Georgia', 'serif'],
        mono: ['"Geist Mono"', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
    },
  },
  corePlugins: {
    // Layout only — visual styling lives in globals.css per the design brief.
    preflight: true,
  },
  plugins: [],
}
