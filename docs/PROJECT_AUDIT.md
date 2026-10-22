# Project Audit Report (AI Affiliate Auto-Pilot)

## 0.1 Technology Stack & Environment
- **Package Manager**: `pnpm` (based on `pnpm-lock.yaml`)
- **Framework**: React 19.0.0, React DOM 19.0.0
- **Build Tooling**: Vite 8.0.5, `@vitejs/plugin-react`
- **Styling**: Tailwind CSS v4 (`@tailwindcss/vite`)
- **Language**: TypeScript 5.7.0, JavaScript (ES Modules)
- **Entry Point**: `src/main.tsx` mounting `src/App.tsx` into `#root` in `index.html`.
- **Global Styling**: `src/index.css` with `@import 'tailwindcss';` and Google Fonts (`Be Vietnam Pro`).
- **Android / Capacitor**: Capacitor Core, CLI, and Android (`@capacitor/core`, `@capacitor/cli`, `@capacitor/android`) installed; native `android/` project generated via `npx cap add android`.

## 0.2 Scripts in package.json
- `pnpm dev`: Runs Vite development server (`vite`)
- `pnpm build`: Builds production bundle (`vite build`)
- `pnpm preview`: Previews production build (`vite preview`)
- `pnpm format`: Runs formatting via `oxfmt`

## 0.3 Current State & Architecture
- **Frontend**: Single-page React application with 15 screens plus Showcase view managed via state and router params.
- **Backend / API**: Client-side services currently integrate Google GenAI SDK (`@google/genai`) and Firebase Auth/Firestore (`firebase`), with fallback demo modes.
- **Android Wrapper**: Capacitor configured (`capacitor.config.ts`), Android platform synchronized.

## 0.4 Risks & Observations
- Secrets management needs careful separation (.env for client public keys, backend secrets for Gemini/payment credentials).
- Production deployment requires dedicated backend workers for FFmpeg video rendering and robust Firestore Security Rules.
