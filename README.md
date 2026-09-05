# Manuja Ravishka — Interactive Portfolio

Next.js, TypeScript, Three.js and GSAP reconstruction of the visual direction at https://www.saifullah.dev/, personalised with Manuja's supplied portrait.

## Run
Requires Node.js 20.9+.
```sh
npm ci
npm run dev
```

## Check and build
```sh
npm run typecheck
npm run build
```
The static production site is generated in `out/`.

## Routes
Home, About, Projects and Contact have direct URLs. The 16 reference project entries each have a refreshable detail route. Browser Back/Forward is supported.

## Portrait
`public/manuja-portrait.webp` is a size-optimised encoding of the photo supplied by Manuja. The original identity and composition are preserved. Three.js samples luminance and local contrast from this photograph to form a shallow point cloud, with subtle pointer parallax. This is a photo-derived depth effect, not a scanned three-dimensional head model.

## Reference content
The project names, thumbnails, ordering and demonstration statistics retain the reference site's content for visual parity, as requested. These are template/reference data, not verified claims about Manuja's experience or work. Original projects are credited to Saifullah Butt in the collection and project details. Replace them in `lib/projects.ts` and `components/Portfolio.tsx` before using this as a factual professional CV. Thumbnail images are served from the original public asset CDN.

Contact actions link to Manuja's verified GitHub profile, because no personal email or phone number was supplied. Typography uses Bebas Neue and IBM Plex Mono as open font substitutes for the reference's custom fonts. Project case-study text is independently summarised; complete original case studies open through the source link.

## Controls
The entry screen loads the portrait before allowing entry. Theme and performance choices are saved locally. Audio starts only when enabled. Sound presets change the synthesised tone. Animation respects reduced-motion preferences. Settings and menu support Escape dismissal.

