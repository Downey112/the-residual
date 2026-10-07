# The Residual: interactive portfolio

Next.js 15 (App Router) + React Three Fiber + Tailwind CSS v4 + Framer Motion.

    npm install
    npm run dev        # http://localhost:3000
    npm run build && npm start

## Edit your content
- `src/content/site.ts`: storefront URLs (`LINKS`, buttons appear only when set), tee specs (verify against your print provider), philosophy quote.
- `src/content/book.ts`: chapter titles, excerpts, figure data.
- `src/content/assets.ts`: the preview index (every item opens a modal).

## Structure
- `src/components/three/`: procedural 3D tee (`teeShape`, `teeTextures`, `TeeScene`) and hardcover book (`bookTextures`, `BookScene`), plus `ViewerStage` (render gating, adaptive DPR, WebGL fallback) and `useDragRotation`.
- `src/components/sections/`: hero, tee, book, asset index, philosophy, footer.
- `src/components/ui/PreviewModal.tsx`: shared-layout (`layoutId`) modal with keyboard navigation (Esc, arrows).
- Fonts are self-hosted via @fontsource (Cinzel, Space Grotesk, Space Mono). Accent: #f59e0b. Background: #09090b.

Rendering only runs while a viewer is on screen. Reduced-motion is respected.
