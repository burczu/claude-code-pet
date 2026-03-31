import Big from 'big.js';
import { evaluate, applyScientific } from './mathEngine';

export const initialState = {
  current: '0',
  previous: null,
  operator: null,
  overwrite: false,
};

export const ACTIONS = {
  ADD_DIGIT: 'ADD_DIGIT',
  CHOOSE_OPERATION: 'CHOOSE_OPERATION',
  CLEAR: 'CLEAR',
  DELETE_DIGIT: 'DELETE_DIGIT',
  EVALUATE: 'EVALUATE',
  PERCENT: 'PERCENT',
  SCIENTIFIC_FN: 'SCIENTIFIC_FN',
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
      return { ...initialState };

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

    case ACTIONS.SCIENTIFIC_FN: {
      if (state.current === 'Error') return state;
      const result = applyScientific(state.current, action.fn);
      return { current: result, previous: null, operator: null, overwrite: true };
    }

    default:
      return state;
  }
}