# Manuja Ravishka — Portfolio

A responsive creative developer portfolio inspired by the monochrome visual direction of https://www.saifullah.dev/. Built independently with **Next.js, React, TypeScript, CSS, Three.js, and GSAP**. No source code, portrait, personal history, or project claims from the reference are reused.

## Run locally

Requires Node.js 20.9+ and npm.

```sh
npm install
npm run dev
```

Open http://localhost:3000.

## Validate and build

```sh
npm run typecheck
npm run build
```

The static production website is generated in `out/`. Deploy this directory to a static host, or import the repository into Vercel with the Next.js preset.

## Personalize

Edit `lib/profile.ts` for your name, biography, email, GitHub links, and projects. The initial version deliberately includes only the known portfolio project. Add your email to enable the email contact action. Font families are loaded from Google Fonts, with local system fallbacks.

## Features

- Four bookmarkable views: Home, About, Projects, Contact.
- Responsive navigation with keyboard focus states and Escape dismissal.
- Interactive Three.js particle geometry with three rendering tiers.
- GSAP transitions that respect reduced-motion preferences.
- Light/dark theme and performance preferences persisted locally.
- Optional synthesized ambient sound, disabled until explicitly enabled.
- Colombo clock and GitHub links.

The abstract visual is an original geometric particle study. Replace or extend `components/ParticleField.tsx` when a personal portrait or 3D asset is available.
