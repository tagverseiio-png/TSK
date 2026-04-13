# GEMINI.md

## Project Overview

**electra-clone** is a premium marketing authority website built with **Next.js 16** (App Router) and **React 19**. It features a modern, cinematic UI with high-end typography, smooth animations using **Framer Motion**, and a sophisticated dark aesthetic. The project aims to showcase brand engineering and growth strategies for premium brands.

### Key Technologies
- **Framework:** [Next.js](https://nextjs.org/) (App Router)
- **Library:** [React 19](https://react.dev/)
- **Language:** [TypeScript](https://www.typescriptlang.org/)
- **Styling:** [Tailwind CSS v4](https://tailwindcss.com/)
- **Animations:** [Framer Motion](https://www.framer.com/motion/)
- **Icons:** [Lucide React](https://lucide.dev/)

### Architecture
- **App Router:** Routing is handled via the `src/app` directory.
- **Components:** Reusable UI elements are located in `src/components`.
- **Styling:** Tailwind CSS v4 with custom theme variables defined in `src/app/globals.css`.
- **Assets:** Custom fonts and images are stored in `public/`.

## Building and Running

### Development
To start the development server:
```bash
npm run dev
```
The application will be available at `http://localhost:3000`.

### Production
To build for production:
```bash
npm run build
```
To start the production server:
```bash
npm start
```

### Linting
To run ESLint:
```bash
npm run lint
```

## Development Conventions

### Styling & UI
- **Colors:**
  - `brand-orange`: `#FF6B00`
  - `brand-black`: `#0D0D0D`
  - `brand-white`: `#FFFFFF`
  - `background`: `#15110f`
- **Typography:**
  - `PPPangramSans`: Primary font for body text.
  - `MonumentExtended`: Display font (use `.font-monument` class) for headers and navigation.
- **Aesthetic:** High-contrast dark theme with a global noise overlay (`NoiseOverlay` component).
- **Navigation:** Fixed header with `mix-blend-difference` for dynamic text color based on background.

### Coding Practices
- **Client Components:** Use the `"use client"` directive for components that require interactivity (e.g., animations, hooks).
- **Animations:** Prefer `framer-motion` for all transitions and interactions.
- **Path Aliases:** Use `@/` to reference the `src/` directory (e.g., `@/components/Hero`).
- **Icons:** Standardize on `lucide-react` for iconography.
- **Scrollbar:** Hidden globally via `globals.css` for a cinematic feel.

### File Structure
- `src/app/`: Routes, layouts, and page-specific styles.
- `src/components/`: Modular, reusable UI components.
- `public/fonts/`: Local storage for custom `.woff2` font files.
