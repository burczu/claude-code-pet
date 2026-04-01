# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm start          # Start Expo dev server
npm run ios        # Start with iOS simulator
npm run android    # Start with Android emulator
npx jest           # Run unit tests
npx jest --watch   # Run tests in watch mode
```

## Architecture

**Expo SDK 54 / React Native 0.81.5 / React 19**, new architecture enabled (`newArchEnabled: true`). Two-screen bottom tab navigator (Home + Settings). Targets iOS, Android, web.

### Key files

- **`App.js`** — root: `GestureHandlerRootView` → `SettingsProvider` → `NavigationContainer` → bottom tabs
- **`calculator/reducer.js`** — `useReducer` state machine; all calculator logic lives here. State shape: `{ current, previous, operator, overwrite, memory, angleMode }`
- **`calculator/mathEngine.js`** — pure math: `evaluate(a, b, op)` for binary ops, `applyScientific(val, fn, angleMode)` for unary scientific functions. Uses `big.js` for float-safe arithmetic.
- **`calculator/formatNumber.js`** — formats display values with `Intl.NumberFormat` thousands separators, respects `precision` setting.
- **`store/SettingsContext.js`** — React Context persisted to AsyncStorage. Settings: `theme` (light/dark/system), `accentColor`, `hapticsEnabled`, `precision`. Holds splash screen until loaded.
- **`theme/colors.js`** — `THEMES.light` / `THEMES.dark` token objects.
- **`services/historyService.js`** — AsyncStorage-backed history (max 50 items, key `@calc_history`).
- **`screens/MainScreen.js`** — calculator UI. In landscape, renders `ScientificPanel` on the left (45% width) alongside the basic 4×5 grid. Button sizing uses `onLayout` to measure actual container dimensions, then computes `buttonSize` (width, column-based) and `buttonHeight` (height, row-based) independently so all 5 rows fit in landscape.
- **`screens/SettingsScreen.js`** — settings + history. `FlatList` with a `useMemo` list header.
- **`components/CalcButton.js`** — memoised button. Accepts separate `buttonSize` (width) and `buttonHeight` props; defaults to square when `buttonHeight` is omitted.
- **`components/ScientificPanel.js`** — landscape-only 4-column × 5-row scientific panel. Local `second` state toggles inverse/alternate functions. Dispatches `SCIENTIFIC_FN`, `CHOOSE_OPERATION` (for `xʸ`/`y√x`), `INSERT_CONSTANT`, `TOGGLE_ANGLE`, and memory actions.

### Scientific calculator features (landscape only)

- **2nd toggle**: flips sin↔sin⁻¹, x²↔√x, xʸ↔ʸ√x, eˣ↔ln, 10ˣ↔log, hyperbolic inverses
- **Angle mode**: DEG/RAD stored in reducer state (`TOGGLE_ANGLE`), survives `CLEAR`
- **Memory**: `memory` in reducer state (session-only, not persisted); mc/m+/m−/mr
- **Constants**: π, e via `INSERT_CONSTANT` action
- **Binary operators**: `xʸ` and `y√x` go through `CHOOSE_OPERATION` like `+`/`−`

### Testing

`__tests__/reducer.test.js` — 65 unit tests covering all actions including trig in both angle modes, hyperbolic functions, memory, constants, and binary power operators.

### Workflow notes

- Commit after each approved phase; push only when all phases are done.
- `app.json` orientation is `"default"` (not `"portrait"`) to allow landscape scientific mode.
- Reanimated is intentionally absent — v4 requires a dev build, not Expo Go.