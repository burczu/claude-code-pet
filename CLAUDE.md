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
- **`calculator/reducer.js`** — `useReducer` state machine; all calculator logic lives here. State shape: `{ current, tokens, previous, operator, overwrite, memory, angleMode }`. `tokens` is the authoritative expression `[{type:'number'|'op'|'paren', value:string}]`; `previous`/`operator` are display hints for PERCENT.
- **`calculator/mathEngine.js`** — pure math: `evaluateTokens(tokens)` for full expression evaluation via shunting-yard, `evaluate(a, b, op)` for simple binary ops, `applyScientific(val, fn, angleMode)` for unary scientific functions. Uses `big.js` for float-safe arithmetic.
- **`calculator/formatNumber.js`** — formats display values with `Intl.NumberFormat` thousands separators, respects `precision` setting.
- **`store/SettingsContext.js`** — React Context persisted to AsyncStorage. Settings: `theme` (light/dark/system), `accentColor`, `hapticsEnabled`, `precision`, `scientificMode`. Holds splash screen until loaded.
- **`theme/colors.js`** — `THEMES.light` / `THEMES.dark` token objects.
- **`services/historyService.js`** — AsyncStorage-backed history (max 50 items, key `@calc_history`).
- **`screens/MainScreen.js`** — calculator UI. Button sizing uses `onLayout` to measure actual container dimensions, then computes `buttonSize` (width-based) and `buttonHeight` (height-based) independently. In landscape + scientific, `ScientificPanel` takes the left 45% and basic grid the remaining 55%. In portrait + scientific, panel sits between display and grid; height is shared equally across all 10 rows.
- **`screens/SettingsScreen.js`** — settings + history. `FlatList` with a `useMemo` list header.
- **`components/CalcButton.js`** — memoised button. Accepts separate `buttonSize` (width) and `buttonHeight` props; defaults to square when `buttonHeight` is omitted.
- **`components/ScientificPanel.js`** — scientific panel with two layouts selected by `orientation` prop: landscape (4-col × 5-row) and portrait (6-col × 5-row, Apple-style). Local `second` state toggles inverse/alternate functions. Dispatches `SCIENTIFIC_FN`, `CHOOSE_OPERATION` (for `xʸ`/`y√x`), `INSERT_CONSTANT`, `TOGGLE_ANGLE`, memory actions, `ADD_EE`, `PAREN_OPEN`, `PAREN_CLOSE`.

### Scientific calculator features

- **Scientific mode toggle**: `settings.scientificMode` gates panel in both orientations; portrait shows 6-col panel above grid, landscape shows 4-col panel to the left
- **2nd toggle**: flips sin↔sin⁻¹, x²↔√x, xʸ↔ʸ√x, eˣ↔ln, 10ˣ↔log, hyperbolic inverses
- **Angle mode**: DEG/RAD stored in reducer state (`TOGGLE_ANGLE`), survives `CLEAR`
- **Memory**: `memory` in reducer state (session-only, not persisted); mc/m+/m−/mr
- **Constants**: π, e via `INSERT_CONSTANT` action
- **Binary operators**: `xʸ` and `y√x` go through `CHOOSE_OPERATION` like `+`/`−`
- **Parentheses**: `PAREN_OPEN`/`PAREN_CLOSE` actions; depth tracked via `openParenDepth(tokens)`
- **EE**: `ADD_EE` appends `e` to current for scientific notation input

### Testing

`__tests__/reducer.test.js` — 65 unit tests covering all actions including trig in both angle modes, hyperbolic functions, memory, constants, and binary power operators.

### Workflow notes

- Commit after each approved phase; push only when all phases are done.
- `app.json` orientation is `"default"` (not `"portrait"`) to allow landscape scientific mode.
- Reanimated is intentionally absent — v4 requires a dev build, not Expo Go.
