/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: ['class', '[data-theme="dark"]'],
  theme: {
    extend: {
      colors: {
        bg: 'var(--bg)',
        'bg-elev1': 'var(--bg-elev1)',
        'bg-elev2': 'var(--bg-elev2)',
        text: 'var(--text)',
        muted: 'var(--muted)',
        subtle: 'var(--subtle)',
        accent: 'var(--accent)',
        success: 'var(--success)',
        warn: 'var(--warn)',
        danger: 'var(--danger)',
        border: 'var(--border)',
        ring: 'var(--ring)',
        card: 'var(--card)',
      },
      borderRadius: {
        DEFAULT: 'var(--radius)',
      },
      boxShadow: {
        DEFAULT: 'var(--shadow)',
      },
      transitionDuration: {
        '180': '180ms',
      },
      animation: {
        'slideDown': 'slideDown 180ms cubic-bezier(0.2, 0.8, 0.2, 1)',
        'fadeIn': 'fadeIn 120ms ease-out',
      },
      keyframes: {
        slideDown: {
          from: {
            opacity: '0',
            transform: 'translateY(-10px)',
          },
          to: {
            opacity: '1',
            transform: 'translateY(0)',
          },
        },
        fadeIn: {
          from: {
            opacity: '0',
          },
          to: {
            opacity: '1',
          },
        },
      },
    },
  },
  plugins: [],
}