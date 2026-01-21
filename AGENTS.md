# Repository Guidelines

## Project Structure & Module Organization

- `src/`: React + TypeScript frontend. Entry in `main.tsx`, top-level layout in `App.tsx`.
- `src/components/`: Reusable UI components (PascalCase filenames like `AccountCard.tsx`).
- `src/pages/`: Route-level views (e.g., `Dashboard.tsx`, `Settings.tsx`).
- `src/assets/` and `public/`: Static assets.
- `src-tauri/`: Tauri (Rust) backend, with Rust modules under `src-tauri/src/` and config in `src-tauri/tauri.conf.json`.

## Build, Test, and Development Commands

- `npm install`: Install frontend dependencies.
- `npm run dev`: Run the Vite dev server (frontend only).
- `npm run build`: Type-check (`tsc`) and build the frontend bundle.
- `npm run preview`: Preview the production build locally.
- `npm run tauri dev`: Run the full desktop app (frontend + Tauri).
- `npm run tauri build`: Build the desktop app (requires Rust toolchain).

## Coding Style & Naming Conventions

- TypeScript + React with ES module syntax (`type: "module"`).
- Use 2-space indentation in TS/TSX and CSS (match existing files).
- Components and pages: `PascalCase.tsx`; utility/modules: `camelCase.ts`.
- No dedicated lint/format config detected; keep diffs minimal and follow existing patterns.

## Testing Guidelines

- No test framework or test files detected in this repository.
- If adding tests, align with the tech stack (e.g., Vitest + React Testing Library) and document how to run them.

## Commit & Pull Request Guidelines

- Recent commits show mixed conventions (e.g., `feat: ...`, `Update ...`, Chinese descriptions).
- Prefer short, imperative summaries; use `feat:`, `fix:`, etc., when appropriate.
- PRs should include a clear description, steps to verify, and screenshots/GIFs for UI changes.
- Link related issues when applicable.

## Security & Configuration Notes

- The app manages local Trae IDE configuration and account data. Avoid logging sensitive tokens.
- Windows-specific paths are used in the product (see README); keep platform assumptions explicit in changes.
