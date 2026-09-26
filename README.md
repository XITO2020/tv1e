# tuveuxun.expert

Site vitrine Naim — consultant IA pour PME, mairies, associations.

## Stack
- Next.js 14 App Router + TypeScript
- React Three Fiber + drei + three.js (3D sculpture hero)
- Tailwind CSS
- Geist + Instrument Serif (next/font)
- Pas de BDD — formulaire mailto, plus tard Web3Forms si besoin

## Direction artistique
- Palette : `obsidian` `#0A0A0C` + `cream` `#F4ECDA` + accent unique `volt` `#D4FF00`
- Typo display : Instrument Serif italic
- Layout : magazine asymetrique 12-col

## Setup

```bash
npm install
npm run dev
# http://localhost:3000
```

## Structure

```
app/
 layout.tsx Root layout, fonts, header, footer
 page.tsx Home (hero 3D)
 tarifs/page.tsx Page tarifs (forfaits + modules + CTA)
 parcours/page.tsx Placeholder CV web
 globals.css Theme + utilities
components/
 Header.tsx
 Footer.tsx
 Sculpture3D.tsx Three.js torus knot iridescent + edges volt
 CustomCursor.tsx Curseur point + ring magnetic
```

## Deploy Vercel

```bash
npm i -g vercel
vercel --prod
```

DNS : pointer `tuveuxun.expert` (Veebimajutus) sur les nameservers Vercel ou A record vers IP Vercel.

## Roadmap V2

- Asset 3D custom genere via Blender + Hunyuan MCP (sculpture organique unique)
- Page parcours complete (port CV V3)
- Formulaire contact Web3Forms (sans backend)
- Animations GSAP scroll-triggered avancees
- OG image generee
