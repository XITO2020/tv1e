import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        obsidian: '#0A0A0C',
        carbon: '#14141A',
        graphite: '#1F1F26',
        // Aqua (light surface, ex-cream)
        aqua: '#D4ECEF',
        aquaDeep: '#B8DAE2',
        // Teal scale (sombre vers ultra-sombre)
        teal: '#1a5e63',
        tealDeep: '#0F3D40',
        tealNight: '#0A2E33',
        // Accent unique (ex-volt + ex-mint fusionnes)
        accent: '#5AD4B6',
        accentDim: '#3FA890',
        // Bleus oceans / pacifique — page Tarifs (02/09). Objectif Naim :
        // sortir de la froideur metallique du reste du site. La page plonge
        // progressivement de la surface vers l'abysse, forfait apres forfait.
        surf: '#7FD4E8', // ecume, accent frais
        pacific: '#2E8BA8', // pacifique clair
        ocean: '#17607F', // pleine eau
        oceanDeep: '#0E4159', // profondeur
        abyss: '#08243A', // abysse
        // Legacy (a retirer progressivement)
        cream: '#D4ECEF',
        creamDeep: '#B8DAE2',
        volt: '#5AD4B6',
        mint: '#5AD4B6',
        ember: '#FF4500',
        ash: '#5A5A66',
        ink: '#0A0A0C',
      },
      fontFamily: {
        sans: ['var(--font-geist-sans)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-geist-mono)', 'monospace'],
        display: ['var(--font-saira)', 'system-ui', 'sans-serif'],
        monodisp: ['var(--font-mono-display)', 'monospace'],
      },
      animation: {
        'pulse-volt': 'pulse-volt 2.4s ease-in-out infinite',
        'marquee': 'marquee 30s linear infinite',
      },
      keyframes: {
        'pulse-volt': {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(212, 255, 0, 0.4)' },
          '50%': { boxShadow: '0 0 0 12px rgba(212, 255, 0, 0)' },
        },
        'marquee': {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
