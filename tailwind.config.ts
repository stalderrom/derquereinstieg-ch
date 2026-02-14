import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        blue:   { DEFAULT: '#2E5C8A', dark: '#1e3f63' },
        orange: { DEFAULT: '#E67E22', dark: '#c96a12' },
        dark:   { DEFAULT: '#1A2332' },
        cream:  { DEFAULT: '#F8F6F2' },
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
      },
      maxWidth: {
        content: '760px',
        wide: '1240px',
      },
    },
  },
  plugins: [],
}

export default config
