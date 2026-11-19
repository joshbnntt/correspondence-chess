# Correspondence Chess

Offline-first PWA for tracking chess games played by post, text or in person.
Enter each move from a letter, keep every game on your device, and back everything
up to (or restore it from) a Markdown file.

## Features
- Multiple games, each with a saved side (White/Black), editable title, and PGN log
- Tap/drag moves on the board or type notation (`Nf3`, `exd5`, `O-O`)
- "Last move" time updates only when a move is actually entered
- Export all games to Markdown, copy as Markdown, and import to restore
- Installable, works fully offline (service worker via `vite-plugin-pwa`)

## Develop
```sh
npm install
npm run dev
```

## Build & deploy
```sh
npm run build   # outputs ./dist — upload to any static HTTPS host (e.g. Netlify)
```
Uses `chess.js` 0.10.x (method names such as `in_checkmate`/`load_pgn`); upgrading to 1.x needs those renamed.

Product spec: [docs/spec.md](docs/spec.md)
