# The Residual — Interactive Portfolio 🌐✨

[![Live Portfolio](https://img.shields.io/badge/Live_Portfolio-Vercel-black?style=flat&logo=vercel&logoColor=white)](https://the-residual-lilac.vercel.app)
[![Next.js 15](https://img.shields.io/badge/Framework-Next.js_15_(App_Router)-black?style=flat&logo=nextdotjs&logoColor=white)](https://nextjs.org/)
[![React Three Fiber](https://img.shields.io/badge/3D-React_Three_Fiber-blue?style=flat&logo=threedotjs&logoColor=white)](https://docs.pmnd.rs/react-three-fiber)
[![Tailwind CSS](https://img.shields.io/badge/Styling-Tailwind_CSS_v4-38B2AC?style=flat&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Framer Motion](https://img.shields.io/badge/Animation-Framer_Motion-black?style=flat&logo=framer&logoColor=white)](https://framer.com/motion)

An interactive, editorial web experience and portfolio exploring econometric and statistical anomalies in Malaysian open data. Built with **Next.js 15 (App Router)**, procedural 3D elements powered by **React Three Fiber (Three.js)**, and reactive animations via **Framer Motion**.

🔗 **Live Deployment:** [the-residual-lilac.vercel.app](https://the-residual-lilac.vercel.app)

---

## 🏗️ Architecture & Component Design

* **Procedural 3D Stage (`src/components/three/`):**
  - Interactive procedural 3D model viewers with adaptive DPR (Device Pixel Ratio) and WebGL fallbacks.
  - Viewport-gated rendering: Three.js animation loops only execute when canvasses enter the active viewport to preserve client GPU/battery life.
  - Native gesture support with smooth inertia drag-rotation (`useDragRotation`).
* **Shared-Layout Modal System (`src/components/ui/`):**
  - Fluid layout transitions using Framer Motion (`layoutId`) with full keyboard navigation (Esc, Arrow keys).
* **Typography & Palette:**
  - Self-hosted web fonts via `@fontsource` (Cinzel, Space Grotesk, Space Mono).
  - Editorial palette: Obsidian `#09090b` and Amber `#f59e0b`.
  - Accessible design respecting OS-level `prefers-reduced-motion` settings.

---

## 📁 Repository Structure

```text
the-residual/
├── src/
│   ├── app/                   # Next.js 15 App Router pages & layout
│   ├── components/
│   │   ├── sections/          # Hero, Philosophy, Assets, Footer
│   │   ├── three/             # 3D canvas stages & shaders
│   │   └── ui/                # Shared layout preview modals
│   └── content/               # Editorial content, figure indices & links
├── public/                    # Static assets & textures
└── package.json               # Dependencies & scripts
```

---

## ⚙️ Local Development

```bash
# 1. Clone repository
git clone https://github.com/Downey112/the-residual.git
cd the-residual

# 2. Install dependencies
npm install

# 3. Start local development server
npm run dev
# Open http://localhost:3000
```

---

## 📄 License

Released under the [MIT License](LICENSE).
