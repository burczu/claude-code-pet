import Big from 'big.js';
import { evaluate, applyScientific } from './mathEngine';

export const initialState = {
  current: '0',
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
  PAREN_OPEN: 'PAREN_OPEN',   // Phase 3
  PAREN_CLOSE: 'PAREN_CLOSE', // Phase 3
};

export function calculatorReducer(state, action) {
  switch (action.type) {
    case ACTIONS.ADD_DIGIT: {
      const { digit } = action;

      if (state.overwrite) {
        return { ...state, current: digit === '.' ? '0.' : digit, overwrite: false };
      }
      if (digit === '.' && state.current.includes('.')) return state;
      if (digit === '0' && state.current === '0') return state;
      if (state.current === '0' && digit !== '.') {
        return { ...state, current: digit };
      }
      if (state.current.replace('-', '').replace('.', '').length >= 12) return state;

      return { ...state, current: state.current + digit };
    }

    case ACTIONS.CHOOSE_OPERATION: {
      const { operator } = action;

      if (state.current === 'Error') return state;

      if (state.previous !== null && !state.overwrite) {
        const result = evaluate(state.previous, state.current, state.operator);
        return { current: result, previous: result, operator, overwrite: true };
      }

      return {
        ...state,
        operator,
        previous: state.current,
        overwrite: true,
      };
    }

    case ACTIONS.CLEAR:
      return { ...initialState, memory: state.memory, angleMode: state.angleMode };

    case ACTIONS.DELETE_DIGIT: {
      if (state.overwrite || state.current === 'Error') {
        return { ...state, current: '0', overwrite: false };
      }
      if (state.current.length === 1 || (state.current.length === 2 && state.current.startsWith('-'))) {
        return { ...state, current: '0' };
      }
      return { ...state, current: state.current.slice(0, -1) };
    }

    case ACTIONS.EVALUATE: {
      if (state.operator === null || state.previous === null || state.current === 'Error') {
        return state;
      }
      const result = evaluate(state.previous, state.current, state.operator);
      return {
        current: result,
        previous: null,
        operator: null,
        overwrite: true,
      };
    }

    case ACTIONS.PERCENT: {
      if (state.current === 'Error') return state;
      try {
        const current = new Big(state.current);
        let result;
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

    case ACTIONS.PAREN_OPEN:
    case ACTIONS.PAREN_CLOSE:
      return state; // Phase 3

    case ACTIONS.SCIENTIFIC_FN: {
      if (state.current === 'Error') return state;
      const result = applyScientific(state.current, action.fn, state.angleMode);
      return { ...state, current: result, previous: null, operator: null, overwrite: true };
    }

    case ACTIONS.TOGGLE_ANGLE:
      return { ...state, angleMode: state.angleMode === 'deg' ? 'rad' : 'deg' };

    case ACTIONS.INSERT_CONSTANT: {
      const constants = { π: String(Math.PI), e: String(Math.E) };
      const value = constants[action.constant];
      if (!value) return state;
      return { ...state, current: value, overwrite: true };
    }

    case ACTIONS.MEMORY_ADD: {
      if (state.current === 'Error') return state;
      try {
        return { ...state, memory: new Big(state.memory).plus(new Big(state.current)).toFixed() };
      } catch { return state; }
    }

    case ACTIONS.MEMORY_SUB: {
      if (state.current === 'Error') return state;
      try {
        return { ...state, memory: new Big(state.memory).minus(new Big(state.current)).toFixed() };
      } catch { return state; }
    }

    case ACTIONS.MEMORY_RECALL:
      return { ...state, current: state.memory, overwrite: true };

    case ACTIONS.MEMORY_CLEAR:
      return { ...state, memory: '0' };

    default:
      return state;
  }
}