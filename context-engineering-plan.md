# Context Engineering Plan

## Goal

Learn context engineering hands-on by enriching the existing Groq assistant in `services/assistantService.ts` with two techniques: few-shot examples and dynamic context injection.

---

## Phase 1 — Few-shot examples

Inject 4 real `user`/`assistant` message pairs (one per tool) into the `messages` array before the conversation history, so the model learns the expected call pattern from concrete examples.

**Decisions:**

- Examples are real message pairs with actual tool call format (not text descriptions in the system prompt)
- All 4 tools covered: `evaluate_expression`, `split_and_tip`, `unit_conversion`, `out_of_scope`
- At least one example includes the `steps` field
- Defined as a `FEW_SHOT_EXAMPLES` constant inline in `assistantService.ts`, alongside `TOOLS` and `SYSTEM_PROMPT`

### Task 1 — Write `FEW_SHOT_EXAMPLES` constant

- File: `services/assistantService.ts`
- Add a `FEW_SHOT_EXAMPLES: ChatCompletionMessageParam[]` constant with one example per tool
- Data only — not wired into `sendMessage` yet

### Task 2 — Inject examples into `sendMessage`

- File: `services/assistantService.ts`
- Spread `FEW_SHOT_EXAMPLES` into the `messages` array after the system message, before real history

---

## Phase 2 — Dynamic context injection

Pass live app state (current display value, angle mode, recent history) into the prompt so the assistant is aware of what's on the calculator screen.

**Decisions:**

- Context fields: `currentValue`, `angleMode`, last 3 history entries
- `sendMessage` gets a new `context` param: `{ angleMode, currentValue, recentHistory }`
- Inside `sendMessage`, system prompt + context are merged into a single `system` message using a structured key-value block:
  ```
  CALCULATOR STATE:
  current_value: 42
  angle_mode: DEG
  recent_history: [10+5=15, 100/4=25, 3×7=21]
  ```
- Calculator state is shared via a new `CalcStateContext` (not AsyncStorage)

**Message array order:**

```
[system prompt + dynamic context]  ← single system message
[few-shot examples]
[real conversation history]
[current user message]
```

### Task 3 — Create `CalcStateContext`

- File: `store/CalcStateContext.tsx` (new file)
- Export: `CalcStateContext`, `CalcStateProvider`, `useCalcState` hook
- Shape: `{ current: string, angleMode: 'DEG' | 'RAD' }`

### Task 4 — Wire provider + publish state

- Files: `App.tsx`, `screens/MainScreen.tsx`
- Wrap navigator with `CalcStateProvider` in `App.tsx`
- `MainScreen` writes `current` and `angleMode` into context whenever they change

### Task 5 — Extend `sendMessage` with context param

- File: `services/assistantService.ts`
- New signature: `sendMessage(userMessage, history, context?)`
- Merge system prompt and context into a single `system` message using the key-value format
- Context param is optional so existing call sites don't break before Task 6

### Task 6 — Update `AssistantScreen` to pass context

- File: `screens/AssistantScreen.tsx`
- Read `{ current, angleMode }` from `useCalcState`
- Read last 3 entries from `historyService`
- Pass assembled context object to `sendMessage`
