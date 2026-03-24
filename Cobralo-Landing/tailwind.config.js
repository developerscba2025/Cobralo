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
          DEFAULT: 'var(--primary)',
          light: 'var(--primary-light)',
          glow: 'var(--primary-glow)',
        },
        bg: {
          DEFAULT: 'var(--bg)',
          soft: 'var(--bg-soft)',
          card: 'var(--bg-card)',
        },
        text: {
          DEFAULT: 'var(--text)',
          muted: 'var(--text-muted)',
          dim: 'var(--text-dim)',
        },
        border: {
          DEFAULT: 'var(--border)',
          bright: 'var(--border-bright)',
        }
      },
      fontFamily: {
        main: ['var(--font-main)', 'sans-serif'],
        accent: ['var(--font-accent)', 'sans-serif'],
        mono: ['var(--font-mono)', 'monospace'],
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        }
      }
    },
  },
  plugins: [],
}
