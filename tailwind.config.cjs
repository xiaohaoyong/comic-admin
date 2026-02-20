/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        sidebar: {
          bg: '#0f172a',
          'bg-secondary': '#1e293b',
          text: '#94a3b8',
          'text-active': '#ffffff',
          hover: 'rgba(255, 255, 255, 0.05)',
        },
        primary: {
          DEFAULT: '#6366f1',
          light: '#818cf8',
          dark: '#4f46e5',
        },
        success: '#10b981',
        warning: '#f59e0b',
        danger: '#ef4444',
        info: '#3b82f6',
      },
      backgroundImage: {
        'gradient-primary': 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
        'gradient-users': 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
        'gradient-vip': 'linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)',
        'gradient-comics': 'linear-gradient(135deg, #10b981 0%, #34d399 100%)',
        'gradient-views': 'linear-gradient(135deg, #ec4899 0%, #f472b6 100%)',
        'gradient-sidebar': 'linear-gradient(180deg, #0f172a 0%, #1e293b 100%)',
      },
      boxShadow: {
        'card': '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
        'card-hover': '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
        'sidebar': '4px 0 6px -1px rgb(0 0 0 / 0.1)',
      },
    },
  },
  plugins: [],
  corePlugins: {
    preflight: false,
  },
}
