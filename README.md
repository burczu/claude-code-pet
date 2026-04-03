# Claude Code Pet — Calculator

A scientific calculator built with Expo / React Native, used as a learning project for [Claude Code](https://claude.ai/code).

## Features

- **Basic calculator** — arithmetic with correct operator precedence via a shunting-yard parser
- **Scientific mode** — toggled in Settings; available in both portrait (6-column panel) and landscape (4-column side panel)
- **Parentheses** — full nested expression support
- **Scientific functions** — trig (sin/cos/tan + inverses), hyperbolic, powers, roots, logarithms, factorial, random
- **2nd toggle** — swaps functions to their inverses (e.g. sin ↔ sin⁻¹, x² ↔ √x)
- **Angle mode** — DEG / RAD, survives clear
- **Memory** — mc / m+ / m− / mr (session-only)
- **Constants** — π, e
- **EE** — scientific notation input
- **History** — last 50 results, persisted via AsyncStorage
- **Themes** — light / dark / system, customisable accent colour
- **Haptics** — optional press feedback
- **Precision** — configurable decimal places

## Getting started

```bash
npm install
npm start          # Expo dev server (scan QR with Expo Go)
npm run ios        # iOS simulator
npm run android    # Android emulator
```

## Running tests

```bash
npx jest           # run once
npx jest --watch   # watch mode
```

## Tech stack

| | |
|---|---|
| Runtime | Expo SDK 54 / React Native 0.81.5 / React 19 |
| Architecture | New Architecture enabled (`newArchEnabled: true`) |
| Math | `big.js` for float-safe arithmetic |
| State | `useReducer` + React Context + AsyncStorage |
| Navigation | React Navigation bottom tabs |
| Gestures | `react-native-gesture-handler` (swipe left to delete digit) |

## Project structure

```
calculator/     pure logic — reducer, math engine, formatter
components/     CalcButton, ScientificPanel
screens/        MainScreen, SettingsScreen
services/       historyService (AsyncStorage)
store/          SettingsContext
theme/          colour tokens
__tests__/      65 unit tests
```