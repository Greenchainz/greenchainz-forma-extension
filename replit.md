# GreenChainz Forma Extension

## Project Overview
A multi-panel Autodesk Forma extension that integrates EPD-verified material sourcing and embodied carbon analysis directly into the building design workflow.

## Architecture
- **Framework**: Preact (lightweight React-compatible)
- **Build System**: Vite (multi-page, two entry points)
- **Language**: TypeScript (strict mode)
- **Package Manager**: pnpm
- **SDK**: forma-embedded-view-sdk (Autodesk Forma)

## Entry Points
- `/left.html` — Material Search panel (search 100k+ EPDs, Material Credit Scores, RFQ)
- `/right.html` — Carbon Analysis panel (auto-detect materials, SWAP Engine for greener alternatives)

## Project Structure
```
src/
  pages/
    left/         # Material Search panel (index.tsx, MaterialSearch.tsx)
    right/        # Carbon Analysis panel (index.tsx, CarbonAnalysis.tsx, ProjectScan.tsx)
  lib/            # Shared utilities
    greenchainz-api.ts  # GreenChainz API client
    auth.ts             # Azure Identity authentication
    types.ts            # TypeScript interfaces
    search-history.ts, retry.ts, a11y.ts  # Helpers
public/           # Static assets (logo.svg)
```

## Development
- Dev server: `pnpm run dev` → runs on port 5000
- Tests: `pnpm test`
- Build: `pnpm run build` → output in `dist/`

## Deployment
- Type: Static site
- Build command: `pnpm run build`
- Public directory: `dist`

## Key Configuration Changes (Replit Setup)
- Vite config updated: port 5000, host 0.0.0.0, allowedHosts: true
- SSL plugin removed for dev compatibility in Replit proxy environment
- Dev script updated to use `vite` (port from config, not CLI flag)
