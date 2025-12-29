/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // DXVK Studio brand colors - Dark volcanic theme
        studio: {
          950: '#0a0a0b',  // Deepest background
          900: '#111113',  // Main background
          850: '#18181b',  // Card background
          800: '#1f1f23',  // Elevated surfaces
          700: '#27272a',  // Borders
          600: '#3f3f46',  // Muted text
          500: '#71717a',  // Secondary text
          400: '#a1a1aa',  // Primary text
          300: '#d4d4d8',  // Headings
          200: '#e4e4e7',  // Bright text
          100: '#fafafa',  // White text
        },
        accent: {
          vulkan: '#ac2a29',   // DXVK red (Vulkan brand color)
          hover: '#c73634',    // Lighter hover state
          pressed: '#8a2221',  // Darker pressed state
          success: '#10b981',  // Green for success states
          warning: '#f59e0b',  // Amber for warnings
          danger: '#ef4444',   // Red for errors
          info: '#3b82f6',     // Blue for info
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Consolas', 'monospace'],
      },
      boxShadow: {
        // Professional elevation system - no glows
        'elevation-1': '0 1px 2px 0 rgb(0 0 0 / 0.15)',
        'elevation-2': '0 1px 3px 0 rgb(0 0 0 / 0.2), 0 1px 2px -1px rgb(0 0 0 / 0.2)',
        'elevation-3': '0 4px 6px -1px rgb(0 0 0 / 0.2), 0 2px 4px -2px rgb(0 0 0 / 0.2)',
        'elevation-4': '0 10px 15px -3px rgb(0 0 0 / 0.25), 0 4px 6px -4px rgb(0 0 0 / 0.2)',
        // Subtle inner highlight for depth
        'inner-highlight': 'inset 0 1px 0 rgb(255 255 255 / 0.03)',
      },
      backdropBlur: {
        'xs': '2px',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fade-in': 'fadeIn 0.2s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}
