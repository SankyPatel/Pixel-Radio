# Pixel Radio

## Overview

Pixel Radio is a web-based internet radio streaming application focused on Indian & Bollywood radio stations. It features a Material You (Material 3) inspired design with a modern, mobile-first interface. Users can browse and play live radio streams, control volume, skip between stations, and cast audio to Chromecast devices. The app is built as a PWA (Progressive Web App) with a full-stack TypeScript architecture.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter (lightweight client-side router)
- **State Management**: TanStack React Query for server state; React hooks (`useState`, `useRef`, `useCallback`) for local state
- **UI Components**: shadcn/ui component library (new-york style) built on Radix UI primitives
- **Styling**: Tailwind CSS v4 with CSS variables for theming, using a Material You / Material 3 inspired color palette with custom CSS theme tokens
- **Animations**: Framer Motion for page transitions and UI animations
- **Fonts**: Plus Jakarta Sans and Outfit (Google Fonts)
- **Audio Playback**: Native HTML5 Audio API with HLS.js for `.m3u8` streams (adaptive bitrate streaming). DOM-attached audio element for iOS background playback compatibility. Auto-recovery on visibility change when stream drops in background.
- **Media Session**: Lock screen / notification center controls with station artwork, play/pause, next/previous track handlers
- **Build Tool**: Vite with React plugin, Tailwind CSS plugin, and custom meta images plugin

### Key Frontend Files
- `client/src/lib/stations.ts` — Static list of radio stations with stream URLs, artwork, and metadata
- `client/src/hooks/use-radio.tsx` — Core audio playback hook managing play/pause, volume, HLS streams, and station switching
- `client/src/pages/Home.tsx` — Main page with station grid and player controls

### Backend
- **Runtime**: Node.js with Express 5
- **Language**: TypeScript (compiled with tsx for dev, esbuild for production)
- **API Pattern**: RESTful routes prefixed with `/api` (currently minimal — routes file is mostly a placeholder)
- **Static Serving**: In production, Express serves the built Vite output from `dist/public`; in development, Vite dev server middleware is used with HMR

### Data Storage
- **Schema Definition**: Drizzle ORM with PostgreSQL dialect (`shared/schema.ts`)
- **Current Storage**: In-memory storage (`MemStorage` class in `server/storage.ts`) — implements an `IStorage` interface for easy swapping to database-backed storage
- **Database Config**: Drizzle Kit configured for PostgreSQL via `DATABASE_URL` environment variable
- **Schema**: Currently has a basic `users` table with `id`, `username`, and `password` fields
- **Migrations**: Output to `./migrations` directory, managed by `drizzle-kit push`

### PWA Support
- Web App Manifest at `client/public/manifest.json` with standalone display mode
- Apple mobile web app meta tags configured
- Multiple icon sizes provided (16, 32, 192, 512)

### Build & Deploy
- **Development**: `npm run dev` starts the Express server with Vite middleware (HMR enabled)
- **Production Build**: `npm run build` runs a custom build script that builds the client with Vite and bundles the server with esbuild
- **Production Start**: `npm start` runs the bundled server from `dist/index.cjs`
- **Database Migrations**: `npm run db:push` pushes schema changes to PostgreSQL

### Path Aliases
- `@/*` → `client/src/*`
- `@shared/*` → `shared/*`
- `@assets` → `attached_assets/`

## External Dependencies

### Database
- **PostgreSQL** — Required for Drizzle ORM; connection via `DATABASE_URL` environment variable
- **Drizzle ORM** — TypeScript ORM for schema definition and queries
- **Drizzle Zod** — Auto-generates Zod validation schemas from Drizzle table definitions

### Audio Streaming
- **HLS.js** — Client-side library for playing HTTP Live Streaming (`.m3u8`) audio streams
- Radio streams are from third-party providers (StreamTheWorld, MainDigitalStream, etc.) — no self-hosted audio

### Google Cast
- **Google Cast SDK** — Loaded client-side for Chromecast support (default receiver app ID: `CC1AD845`)

### UI Libraries
- **Radix UI** — Full suite of accessible, unstyled UI primitives (dialog, popover, select, tabs, toast, etc.)
- **shadcn/ui** — Pre-styled component wrappers around Radix primitives
- **Framer Motion** — Animation library for React
- **Lucide React** — Icon library
- **Embla Carousel** — Carousel component
- **cmdk** — Command palette component
- **Vaul** — Drawer component
- **class-variance-authority** + **clsx** + **tailwind-merge** — Utility functions for conditional CSS class composition

### Fonts
- **Google Fonts** — Plus Jakarta Sans, Outfit (loaded via CDN)

### Replit-Specific
- `@replit/vite-plugin-runtime-error-modal` — Error overlay in development
- `@replit/vite-plugin-cartographer` — Development tooling (dev only)
- `@replit/vite-plugin-dev-banner` — Development banner (dev only)