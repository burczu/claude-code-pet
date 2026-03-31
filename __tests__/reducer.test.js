import { calculatorReducer, initialState, ACTIONS } from '../calculator/reducer';

function dispatch(state, action) {
  return calculatorReducer(state, action);
}

function typeDigits(digits, state = initialState) {
  return digits.split('').reduce(
    (s, digit) => dispatch(s, { type: ACTIONS.ADD_DIGIT, digit }),
    state
  );
}

describe('CLEAR', () => {
  it('resets to initial state', () => {
    const s = typeDigits('123');
    expect(dispatch(s, { type: ACTIONS.CLEAR })).toEqual(initialState);
  });
});

describe('ADD_DIGIT', () => {
  it('replaces leading zero with a digit', () => {
    const s = dispatch(initialState, { type: ACTIONS.ADD_DIGIT, digit: '5' });
    expect(s.current).toBe('5');
  });

  it('appends digits', () => {
    const s = typeDigits('42');
    expect(s.current).toBe('42');
  });

  it('allows a single decimal point', () => {
    const s = typeDigits('1.');
    expect(s.current).toBe('1.');
  });

  it('ignores a second decimal point', () => {
    const s = typeDigits('1.5.');
    expect(s.current).toBe('1.5');
  });

  it('does not exceed 12 digits', () => {
    const s = typeDigits('1234567890123');
    expect(s.current.replace('.', '').replace('-', '').length).toBeLessThanOrEqual(12);
  });

  it('starts fresh after a result (overwrite flag)', () => {
    let s = typeDigits('5');
    s = dispatch(s, { type: ACTIONS.CHOOSE_OPERATION, operator: '+' });
    s = typeDigits('3', s);
    s = dispatch(s, { type: ACTIONS.EVALUATE });
    s = dispatch(s, { type: ACTIONS.ADD_DIGIT, digit: '9' });
    expect(s.current).toBe('9');
  });
});

describe('DELETE_DIGIT', () => {
  it('removes the last digit', () => {
    const s = dispatch(typeDigits('42'), { type: ACTIONS.DELETE_DIGIT });
    expect(s.current).toBe('4');
  });

  it('resets to 0 when only one digit remains', () => {
    const s = dispatch(typeDigits('5'), { type: ACTIONS.DELETE_DIGIT });
    expect(s.current).toBe('0');
  });

  it('resets to 0 on overwrite state', () => {
    let s = typeDigits('5');
    s = dispatch(s, { type: ACTIONS.CHOOSE_OPERATION, operator: '+' });
    s = dispatch(s, { type: ACTIONS.DELETE_DIGIT });
    expect(s.current).toBe('0');
  });
});

describe('CHOOSE_OPERATION', () => {
  it('stores the operator and moves current to previous', () => {
    let s = typeDigits('5');
    s = dispatch(s, { type: ACTIONS.CHOOSE_OPERATION, operator: '+' });
    expect(s.previous).toBe('5');
    expect(s.operator).toBe('+');
  });

  it('chains operations: 5 + 3 × gives 8 ×', () => {
    let s = typeDigits('5');
    s = dispatch(s, { type: ACTIONS.CHOOSE_OPERATION, operator: '+' });
    s = typeDigits('3', s);
    s = dispatch(s, { type: ACTIONS.CHOOSE_OPERATION, operator: '×' });
    expect(s.current).toBe('8');
    expect(s.operator).toBe('×');
  });
});

describe('EVALUATE', () => {
  it('adds two numbers', () => {
    let s = typeDigits('3');
    s = dispatch(s, { type: ACTIONS.CHOOSE_OPERATION, operator: '+' });
    s = typeDigits('2', s);
    s = dispatch(s, { type: ACTIONS.EVALUATE });
    expect(s.current).toBe('5');
  });

  it('subtracts two numbers', () => {
    let s = typeDigits('9');
    s = dispatch(s, { type: ACTIONS.CHOOSE_OPERATION, operator: '-' });
    s = typeDigits('4', s);
    s = dispatch(s, { type: ACTIONS.EVALUATE });
    expect(s.current).toBe('5');
  });

  it('multiplies two numbers', () => {
    let s = typeDigits('6');
    s = dispatch(s, { type: ACTIONS.CHOOSE_OPERATION, operator: '×' });
    s = typeDigits('7', s);
    s = dispatch(s, { type: ACTIONS.EVALUATE });
    expect(s.current).toBe('42');
  });

  it('divides two numbers', () => {
    let s = typeDigits('10');
    s = dispatch(s, { type: ACTIONS.CHOOSE_OPERATION, operator: '÷' });
    s = typeDigits('4', s);
    s = dispatch(s, { type: ACTIONS.EVALUATE });
    expect(s.current).toBe('2.5');
  });

  it('handles 0.1 + 0.2 without floating-point error', () => {
    let s = typeDigits('0.1');
    s = dispatch(s, { type: ACTIONS.CHOOSE_OPERATION, operator: '+' });
    s = typeDigits('0.2', s);
    s = dispatch(s, { type: ACTIONS.EVALUATE });
    expect(s.current).toBe('0.3');
  });

  it('returns Error on division by zero', () => {
    let s = typeDigits('5');
    s = dispatch(s, { type: ACTIONS.CHOOSE_OPERATION, operator: '÷' });
    s = typeDigits('0', s);
    s = dispatch(s, { type: ACTIONS.EVALUATE });
    expect(s.current).toBe('Error');
  });

  it('does nothing if no operator is set', () => {
    const s = typeDigits('5');
    expect(dispatch(s, { type: ACTIONS.EVALUATE })).toEqual(s);
  });

  it('resets operator and previous after evaluation', () => {
    let s = typeDigits('3');
    s = dispatch(s, { type: ACTIONS.CHOOSE_OPERATION, operator: '+' });
    s = typeDigits('2', s);
    s = dispatch(s, { type: ACTIONS.EVALUATE });
    expect(s.operator).toBeNull();
    expect(s.previous).toBeNull();
    expect(s.overwrite).toBe(true);
  });
});

describe('PERCENT', () => {
  it('divides standalone value by 100', () => {
    let s = typeDigits('50');
    s = dispatch(s, { type: ACTIONS.PERCENT });
    expect(s.current).toBe('0.5');
  });

  it('calculates percent of previous operand for + operation', () => {
    let s = typeDigits('200');
    s = dispatch(s, { type: ACTIONS.CHOOSE_OPERATION, operator: '+' });
    s = typeDigits('10', s);
    s = dispatch(s, { type: ACTIONS.PERCENT });
    expect(s.current).toBe('20');
  });

  it('calculates percent of previous operand for - operation', () => {
    let s = typeDigits('200');
    s = dispatch(s, { type: ACTIONS.CHOOSE_OPERATION, operator: '-' });
    s = typeDigits('10', s);
    s = dispatch(s, { type: ACTIONS.PERCENT });
    expect(s.current).toBe('20');
  });

  it('divides by 100 for × operation', () => {
    let s = typeDigits('200');
    s = dispatch(s, { type: ACTIONS.CHOOSE_OPERATION, operator: '×' });
    s = typeDigits('10', s);
    s = dispatch(s, { type: ACTIONS.PERCENT });
    expect(s.current).toBe('0.1');
  });
});

describe('SCIENTIFIC_FN', () => {
  it('calculates square of a number', () => {
    let s = typeDigits('4');
    s = dispatch(s, { type: ACTIONS.SCIENTIFIC_FN, fn: 'x²' });
    expect(s.current).toBe('16');
  });

  it('calculates square root', () => {
    let s = typeDigits('9');
    s = dispatch(s, { type: ACTIONS.SCIENTIFIC_FN, fn: '√' });
    expect(s.current).toBe('3');
  });

  it('returns Error for sqrt of a negative number', () => {
    let s = typeDigits('9');
    s = dispatch(s, { type: ACTIONS.SCIENTIFIC_FN, fn: '√' });
    s = dispatch(s, { type: ACTIONS.ADD_DIGIT, digit: '-' });
    s = dispatch(s, { type: ACTIONS.SCIENTIFIC_FN, fn: '√' });
    expect(s.current).toBe('Error');
  });

  it('calculates 1/x', () => {
    let s = typeDigits('4');
    s = dispatch(s, { type: ACTIONS.SCIENTIFIC_FN, fn: '1/x' });
    expect(s.current).toBe('0.25');
  });

  it('returns Error for 1/0', () => {
    const s = dispatch(initialState, { type: ACTIONS.SCIENTIFIC_FN, fn: '1/x' });
    expect(s.current).toBe('Error');
  });
});