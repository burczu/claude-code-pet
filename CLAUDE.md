# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm start          # Start Expo dev server (opens QR code / dev menu)
npm run ios        # Start with iOS simulator
npm run android    # Start with Android emulator
npm run web        # Start with web browser
```

## Architecture

This is a minimal **Expo (React Native)** project using the **blank template** with the new architecture enabled (`newArchEnabled: true`).

- **`App.js`** — single root component, entry point registered via `index.js`
- **`app.json`** — Expo config: app name `claude-code-pet`, portrait orientation, light UI style
- **`assets/`** — static images (icon, splash, adaptive icon, favicon)

The app targets iOS, Android, and web. No navigation, state management, or routing library is installed yet.