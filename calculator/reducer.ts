import Big from 'big.js';
import {
  evaluateTokens,
  applyScientific,
  Token,
  AngleMode,
  ScientificFn,
  Operator,
} from './mathEngine';

const MAX_DISPLAY_DIGITS = 12;

export interface CalculatorState {
  current: string;
  tokens: Token[]; // [{type:'number'|'op'|'paren', value:string}] — full expression
  previous: string | null; // last committed number (display hint for PERCENT)
  operator: Operator | null; // last operator (display hint for PERCENT)
  overwrite: boolean;
  memory: string;
  angleMode: AngleMode;
}

export const initialState: CalculatorState = {
  current: '0',
  tokens: [],
  previous: null,
  operator: null,
  overwrite: false,
  memory: '0',
  angleMode: 'deg',
};

export const ACTIONS = {
  ADD_DIGIT: 'ADD_DIGIT',
  ADD_EE: 'ADD_EE',
  CHOOSE_OPERATION: 'CHOOSE_OPERATION',
  CLEAR: 'CLEAR',
  DELETE_DIGIT: 'DELETE_DIGIT',
  EVALUATE: 'EVALUATE',
  PERCENT: 'PERCENT',
  SCIENTIFIC_FN: 'SCIENTIFIC_FN',
  TOGGLE_ANGLE: 'TOGGLE_ANGLE',
  INSERT_CONSTANT: 'INSERT_CONSTANT',
  MEMORY_ADD: 'MEMORY_ADD',
  MEMORY_SUB: 'MEMORY_SUB',
  MEMORY_RECALL: 'MEMORY_RECALL',
  MEMORY_CLEAR: 'MEMORY_CLEAR',
  PAREN_OPEN: 'PAREN_OPEN',
  PAREN_CLOSE: 'PAREN_CLOSE',
} as const;

export type ActionType = (typeof ACTIONS)[keyof typeof ACTIONS];

export type CalculatorAction =
  | { type: 'ADD_DIGIT'; digit: string }
  | { type: 'ADD_EE' }
  | { type: 'CHOOSE_OPERATION'; operator: Operator }
  | { type: 'CLEAR' }
  | { type: 'DELETE_DIGIT' }
  | { type: 'EVALUATE' }
  | { type: 'PERCENT' }
  | { type: 'SCIENTIFIC_FN'; fn: ScientificFn }
  | { type: 'TOGGLE_ANGLE' }
  | { type: 'INSERT_CONSTANT'; constant: string }
  | { type: 'MEMORY_ADD' }
  | { type: 'MEMORY_SUB' }
  | { type: 'MEMORY_RECALL' }
  | { type: 'MEMORY_CLEAR' }
  | { type: 'PAREN_OPEN' }
  | { type: 'PAREN_CLOSE' };

function openParenDepth(tokens: Token[]): number {
  return tokens.reduce((d, t) => d + (t.value === '(' ? 1 : t.value === ')' ? -1 : 0), 0);
}

export function calculatorReducer(
  state: CalculatorState,
  action: CalculatorAction,
): CalculatorState {
  switch (action.type) {
    case ACTIONS.ADD_DIGIT: {
      const { digit } = action;
      if (state.overwrite) {
        return { ...state, current: digit === '.' ? '0.' : digit, overwrite: false };
      }
      if (digit === '.' && state.current.includes('.')) return state;
      if (digit === '0' && state.current === '0') return state;
      if (state.current === '0' && digit !== '.') return { ...state, current: digit };
      if (state.current.replace('-', '').replace('.', '').length >= MAX_DISPLAY_DIGITS) {
        return state;
      }
      return { ...state, current: state.current + digit };
    }

    case ACTIONS.CHOOSE_OPERATION: {
      const { operator } = action;
      if (state.current === 'Error') return state;

      const last = state.tokens[state.tokens.length - 1];

      // User changed their mind about the operator — replace it
      if (last?.type === 'op') {
        return {
          ...state,
          tokens: [...state.tokens.slice(0, -1), { type: 'op', value: operator }],
          operator,
        };
      }

      // Commit current number if user typed something (not overwrite) or expression is empty
      const commitCurrent = !state.overwrite || state.tokens.length === 0;
      const newTokens = commitCurrent
        ? [
            ...state.tokens,
            { type: 'number' as const, value: state.current },
            { type: 'op' as const, value: operator },
          ]
        : [...state.tokens, { type: 'op' as const, value: operator }];

      return { ...state, tokens: newTokens, previous: state.current, operator, overwrite: true };
    }

    case ACTIONS.CLEAR:
      return { ...initialState, memory: state.memory, angleMode: state.angleMode };

    case ACTIONS.DELETE_DIGIT: {
      if (state.current === 'Error') return { ...state, current: '0', overwrite: false };
      if (state.overwrite) {
        // If last token is an operator, undo it
        const last = state.tokens[state.tokens.length - 1];
        if (last?.type === 'op') {
          const withoutOp = state.tokens.slice(0, -1);
          const prevNum = withoutOp[withoutOp.length - 1];
          return {
            ...state,
            tokens: prevNum?.type === 'number' ? withoutOp.slice(0, -1) : withoutOp,
            current: prevNum?.type === 'number' ? prevNum.value : state.current,
            operator: null,
            overwrite: false,
          };
        }
        return { ...state, current: '0', overwrite: false };
      }
      if (
        state.current.length === 1 ||
        (state.current.length === 2 && state.current.startsWith('-'))
      ) {
        return { ...state, current: '0' };
      }
      return { ...state, current: state.current.slice(0, -1) };
    }

    case ACTIONS.EVALUATE: {
      if (state.current === 'Error' || state.tokens.length === 0) return state;
      const last = state.tokens[state.tokens.length - 1];
      // If last token is a closing paren, expression is already complete in tokens
      const fullTokens =
        last?.type === 'paren' && last?.value === ')'
          ? state.tokens
          : [...state.tokens, { type: 'number' as const, value: state.current }];
      const result = evaluateTokens(fullTokens);
      return {
        ...state,
        current: result,
        tokens: [],
        previous: null,
        operator: null,
        overwrite: true,
      };
    }

    case ACTIONS.PERCENT: {
      if (state.current === 'Error') return state;
      try {
        const current = new Big(state.current);
        let result: Big;
        if (state.previous !== null && (state.operator === '+' || state.operator === '-')) {
          result = current.div(100).times(new Big(state.previous));
        } else {
          result = current.div(100);
        }
        return { ...state, current: result.toFixed(), overwrite: true };
      } catch {
        return state;
      }
    }

    case ACTIONS.ADD_EE: {
      if (state.current === 'Error' || state.current.includes('e') || state.overwrite) return state;
      return { ...state, current: state.current + 'e' };
    }

    case ACTIONS.PAREN_OPEN: {
      // Allow ( after an operator, at start of expression, or at start (tokens empty)
      const last = state.tokens[state.tokens.length - 1];
      const canOpen = state.tokens.length === 0 || last?.type === 'op' || last?.value === '(';
      if (!canOpen) return state;
      return {
        ...state,
        tokens: [...state.tokens, { type: 'paren' as const, value: '(' }],
        current: '0',
        overwrite: false,
      };
    }

    case ACTIONS.PAREN_CLOSE: {
      if (openParenDepth(state.tokens) <= 0) return state; // no open paren to close
      if (state.current === 'Error') return state;
      const last = state.tokens[state.tokens.length - 1];
      // Don't close onto another '(' with nothing inside
      if (last?.value === '(') return state;
      const newTokens =
        last?.type === 'paren' && last?.value === ')'
          ? [...state.tokens, { type: 'paren' as const, value: ')' }]
          : [
              ...state.tokens,
              { type: 'number' as const, value: state.current },
              { type: 'paren' as const, value: ')' },
            ];
      return { ...state, tokens: newTokens, overwrite: true };
    }

    case ACTIONS.SCIENTIFIC_FN: {
      if (state.current === 'Error') return state;
      const result = applyScientific(state.current, action.fn, state.angleMode);
      return { ...state, current: result, overwrite: true };
    }

    case ACTIONS.TOGGLE_ANGLE:
      return { ...state, angleMode: state.angleMode === 'deg' ? 'rad' : 'deg' };

    case ACTIONS.INSERT_CONSTANT: {
      const constants: Record<string, string> = { π: String(Math.PI), e: String(Math.E) };
      const value = constants[action.constant];
      if (!value) return state;
      return { ...state, current: value, overwrite: true };
    }

    case ACTIONS.MEMORY_ADD: {
      if (state.current === 'Error') return state;
      try {
        return { ...state, memory: new Big(state.memory).plus(new Big(state.current)).toFixed() };
      } catch {
        return state;
      }
    }

    case ACTIONS.MEMORY_SUB: {
      if (state.current === 'Error') return state;
      try {
        return { ...state, memory: new Big(state.memory).minus(new Big(state.current)).toFixed() };
      } catch {
        return state;
      }
    }

    case ACTIONS.MEMORY_RECALL:
      return { ...state, current: state.memory, overwrite: true };

    case ACTIONS.MEMORY_CLEAR:
      return { ...state, memory: '0' };

    default:
      return state;
  }
}
