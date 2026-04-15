# Smart Conversational Assistant — Implementation Plan

## Constraints from the existing codebase

- **Reanimated is intentionally absent** (v4 requires a dev build, not Expo Go) — UI transitions will use `LayoutAnimation` (built into React Native core) instead
- **`big.js` already handles math** — no need to add `math.js`; reuse the existing `mathEngine.ts`
- **Context already used for settings** — Zustand for assistant state keeps it isolated without touching the existing Context setup

---

## Phase 1 — API key management & OpenAI client

Install `react-native-config` for secure `.env` key storage. Install the official `openai` Node SDK. Configure a typed client instance exported from `services/openaiClient.ts`. No UI — just the foundation.

**Files:**
- `.env` — `OPENAI_API_KEY=...` (gitignored)
- `.env.example` — committed to git; documents the required env var shape for new contributors
- `services/openaiClient.ts` — configured `OpenAI` instance

---

## Phase 2 — Assistant service with function calling + out-of-scope handling

Create `services/assistantService.ts` with:

- A **system prompt** that restricts the assistant to math, calculations, and unit conversions, and instructs it to call `out_of_scope` for anything else
- **Function schemas** passed to the Chat Completions API:
  - `evaluate_expression` — general math/arithmetic (delegates to existing `evaluateTokens` from `mathEngine.ts`)
  - `split_and_tip` — bill splitting with optional tip percentage
  - `unit_conversion` — unit conversions (length, weight, temperature, etc.)
  - `out_of_scope` — called by the model when the prompt is unrelated to math; carries a `reason` string. The service layer maps this to a typed signal; the UI renders a friendly i18n-translated decline message rather than a result
- **Contextual memory** — a rolling `messages[]` array (last 10 turns) passed with every request so follow-up queries like *"Now take 20% off that"* resolve correctly
- **Step-by-step explanation** — each math function schema includes an optional `steps: string[]` field the model populates when the prompt implies educational intent

**Files:**
- `services/assistantService.ts`

---

## Phase 3 — Chat UI (new Assistant tab)

Add a third bottom tab: **Assistant**. Build `screens/AssistantScreen.tsx` with:

- A `FlatList` of message bubbles (user / assistant / error)
- Streaming responses rendered token-by-token as SSE chunks arrive
- An expandable "Show working" row on assistant bubbles when `steps` are present
- `LayoutAnimation` for bubble appearance (no Reanimated required)
- When the model calls `out_of_scope`, the bubble renders a canned decline message (e.g. *"I can only help with calculations"*) styled distinctly from a normal result
- A `TextInput` + send button at the bottom (safe area aware)

**Files:**
- `screens/AssistantScreen.tsx`
- `components/assistant/MessageBubble.tsx`
- `components/assistant/StepsAccordion.tsx`
- `components/assistant/ChatInput.tsx`

---

## Phase 4 — History integration & "use this result" bridge

- Wire assistant results into the existing `historyService` so they appear alongside manual calculations in the Settings history list
- Add a **"Use result"** button on assistant answer bubbles that navigates to the Home tab and seeds the calculator display with that value (same `navigation.navigate('Home', { initialValue })` pattern already used in `SettingsScreen`)

**Files:** changes to `screens/AssistantScreen.tsx`, `components/assistant/MessageBubble.tsx`

---

## Phase 5 — Voice input (Speech-to-Text)

- `expo-av` to record audio from the microphone
- POST recording to the **OpenAI Whisper API** for transcription
- Transcribed text populates the chat input and auto-submits
- `expo-speech` for TTS — optionally reads the assistant's result aloud

**Files:**
- `services/speechService.ts` — recording + Whisper transcription + TTS
- Changes to `components/assistant/ChatInput.tsx` — microphone button

---

## Phase 6 — i18n & CLAUDE.md update

- Add translation keys for all assistant UI strings to `i18n/en.ts` and `i18n/pl.ts` (`TranslationKeys` interface updated first)
- Update `CLAUDE.md` to document the assistant architecture, function schemas, and `out_of_scope` pattern

---

## Ordering

```
Phase 1 (API client)
    ↓
Phase 2 (assistant service)
    ↓
Phase 3 (chat UI)
    ↓
Phase 4 (history bridge)   ← independent of 5 and 6
Phase 5 (voice input)      ← independent of 4 and 6
Phase 6 (i18n + docs)      ← independent of 4 and 5
```