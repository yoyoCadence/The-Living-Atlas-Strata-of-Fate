# The Living Atlas: Strata of Fate

Languages: [繁體中文](README.md) | [简体中文](README.zh-CN.md) | English | [日本語](README.ja.md)

## Overview

A 3D procedural open-world exploration RPG research prototype.  
The world is not merely explored by you; it grows new fate from **how** you explore.

## Quick Start

```powershell
npm install
npm run dev
```

Open `http://localhost:5180`.

This project uses port `5180` with `strictPort` enabled in `vite.config.js`. Port `5173` is reserved for another local PWA project to avoid service-worker cache conflicts.

## Controls

| Input | Action |
|---|---|
| WASD / left joystick | Move; hold Shift to sprint |
| Mouse movement / right-side drag | Camera control |
| Space / jump button | Jump; hold in midair to glide after Wind Sense is unlocked |
| E / scan button | Scan, interact, validate hypotheses, climb, talk |
| F | Hunt / help NPCs |
| M | Living Map |
| 1–7 | Toggle abilities |
| `` ` `` | Debug console; enter `help` |

Use `?seed=any-string` in the URL to choose a world seed.

## Validation

```powershell
npm test
node test/browser-check.mjs
npm run build
```

`node test/browser-check.mjs` requires the dev server to be running first.

## Documentation

- [docs/GDD.md](docs/GDD.md)
- [docs/CODEX_ASSET_BRIEF.md](docs/CODEX_ASSET_BRIEF.md)
- [docs/CODEX_ASSET_AUDIT.md](docs/CODEX_ASSET_AUDIT.md)
- [docs/ART_PIPELINE.md](docs/ART_PIPELINE.md)

## Design Principles

Retention comes from curiosity, competence, agency, unfinished mysteries, world response, and personal fate.  
The project does not use loot boxes, gacha, near-miss rewards, daily-login punishment, time-limited anxiety, energy systems, or paid acceleration.
