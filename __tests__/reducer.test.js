import { calculatorReducer, initialState, ACTIONS } from '../calculator/reducer';

function dispatch(state, action) {
  return calculatorReducer(state, action);
}

function typeDigits(digits, state = initialState) {
  return digits
    .split('')
    .reduce((s, digit) => dispatch(s, { type: ACTIONS.ADD_DIGIT, digit }), state);
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
    expect(s.current).toBe('5');
    expect(s.operator).toBe(null);
  });
});

describe('CHOOSE_OPERATION', () => {
  it('stores the operator and moves current to previous', () => {
    let s = typeDigits('5');
    s = dispatch(s, { type: ACTIONS.CHOOSE_OPERATION, operator: '+' });
    expect(s.previous).toBe('5');
    expect(s.operator).toBe('+');
  });

  it('chains operations: 5 + 3 × appends to tokens without eager eval', () => {
    let s = typeDigits('5');
    s = dispatch(s, { type: ACTIONS.CHOOSE_OPERATION, operator: '+' });
    s = typeDigits('3', s);
    s = dispatch(s, { type: ACTIONS.CHOOSE_OPERATION, operator: '×' });
    expect(s.current).toBe('3');
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

  it('calculates cube of a number', () => {
    let s = typeDigits('3');
    s = dispatch(s, { type: ACTIONS.SCIENTIFIC_FN, fn: 'x³' });
    expect(s.current).toBe('27');
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

  it('calculates cube root', () => {
    let s = typeDigits('27');
    s = dispatch(s, { type: ACTIONS.SCIENTIFIC_FN, fn: '³√' });
    expect(parseFloat(s.current)).toBeCloseTo(3, 10);
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

  it('calculates eˣ', () => {
    let s = typeDigits('1');
    s = dispatch(s, { type: ACTIONS.SCIENTIFIC_FN, fn: 'eˣ' });
    expect(parseFloat(s.current)).toBeCloseTo(Math.E, 10);
  });

  it('calculates 10ˣ', () => {
    let s = typeDigits('3');
    s = dispatch(s, { type: ACTIONS.SCIENTIFIC_FN, fn: '10ˣ' });
    expect(s.current).toBe('1000');
  });

  it('calculates ln', () => {
    let s = typeDigits('1');
    s = dispatch(s, { type: ACTIONS.SCIENTIFIC_FN, fn: 'ln' });
    expect(s.current).toBe('0');
  });

  it('returns Error for ln of non-positive', () => {
    const s = dispatch(initialState, { type: ACTIONS.SCIENTIFIC_FN, fn: 'ln' });
    expect(s.current).toBe('Error');
  });

  it('calculates log base 10', () => {
    let s = typeDigits('100');
    s = dispatch(s, { type: ACTIONS.SCIENTIFIC_FN, fn: 'log' });
    expect(s.current).toBe('2');
  });

  it('calculates factorial', () => {
    let s = typeDigits('5');
    s = dispatch(s, { type: ACTIONS.SCIENTIFIC_FN, fn: 'x!' });
    expect(s.current).toBe('120');
  });

  it('returns Error for factorial of negative', () => {
    let s = typeDigits('3');
    s = dispatch(s, { type: ACTIONS.SCIENTIFIC_FN, fn: 'x²' }); // 9
    s = dispatch(s, { type: ACTIONS.SCIENTIFIC_FN, fn: '1/x' }); // 1/9 — non-integer
    s = dispatch(s, { type: ACTIONS.SCIENTIFIC_FN, fn: 'x!' });
    expect(s.current).toBe('Error');
  });

  describe('trig — DEG mode (default)', () => {
    it('sin 30° = 0.5', () => {
      let s = typeDigits('30');
      s = dispatch(s, { type: ACTIONS.SCIENTIFIC_FN, fn: 'sin' });
      expect(parseFloat(s.current)).toBeCloseTo(0.5, 10);
    });

    it('cos 60° = 0.5', () => {
      let s = typeDigits('60');
      s = dispatch(s, { type: ACTIONS.SCIENTIFIC_FN, fn: 'cos' });
      expect(parseFloat(s.current)).toBeCloseTo(0.5, 10);
    });

    it('asin 1 = 90 (degrees)', () => {
      let s = typeDigits('1');
      s = dispatch(s, { type: ACTIONS.SCIENTIFIC_FN, fn: 'asin' });
      expect(parseFloat(s.current)).toBeCloseTo(90, 10);
    });

    it('returns Error for asin > 1', () => {
      let s = typeDigits('2');
      s = dispatch(s, { type: ACTIONS.SCIENTIFIC_FN, fn: 'asin' });
      expect(s.current).toBe('Error');
    });
  });

  describe('trig — RAD mode', () => {
    function radState() {
      return dispatch(initialState, { type: ACTIONS.TOGGLE_ANGLE });
    }

    it('sin π/2 = 1', () => {
      let s = typeDigits((Math.PI / 2).toString(), radState());
      s = dispatch(s, { type: ACTIONS.SCIENTIFIC_FN, fn: 'sin' });
      expect(parseFloat(s.current)).toBeCloseTo(1, 10);
    });

    it('asin 1 = π/2 (radians)', () => {
      let s = typeDigits('1', radState());
      s = dispatch(s, { type: ACTIONS.SCIENTIFIC_FN, fn: 'asin' });
      expect(parseFloat(s.current)).toBeCloseTo(Math.PI / 2, 10);
    });
  });

  describe('hyperbolic', () => {
    it('sinh 0 = 0', () => {
      const s = dispatch(initialState, { type: ACTIONS.SCIENTIFIC_FN, fn: 'sinh' });
      expect(s.current).toBe('0');
    });

    it('cosh 0 = 1', () => {
      const s = dispatch(initialState, { type: ACTIONS.SCIENTIFIC_FN, fn: 'cosh' });
      expect(s.current).toBe('1');
    });

    it('tanh 0 = 0', () => {
      const s = dispatch(initialState, { type: ACTIONS.SCIENTIFIC_FN, fn: 'tanh' });
      expect(s.current).toBe('0');
    });

    it('asinh 0 = 0', () => {
      const s = dispatch(initialState, { type: ACTIONS.SCIENTIFIC_FN, fn: 'asinh' });
      expect(s.current).toBe('0');
    });

    it('returns Error for acosh < 1', () => {
      const s = dispatch(initialState, { type: ACTIONS.SCIENTIFIC_FN, fn: 'acosh' });
      expect(s.current).toBe('Error');
    });

    it('returns Error for atanh = 1', () => {
      let s = typeDigits('1');
      s = dispatch(s, { type: ACTIONS.SCIENTIFIC_FN, fn: 'atanh' });
      expect(s.current).toBe('Error');
    });
  });
});

describe('TOGGLE_ANGLE', () => {
  it('toggles from deg to rad', () => {
    const s = dispatch(initialState, { type: ACTIONS.TOGGLE_ANGLE });
    expect(s.angleMode).toBe('rad');
  });

  it('toggles back to deg', () => {
    let s = dispatch(initialState, { type: ACTIONS.TOGGLE_ANGLE });
    s = dispatch(s, { type: ACTIONS.TOGGLE_ANGLE });
    expect(s.angleMode).toBe('deg');
  });

  it('survives CLEAR', () => {
    let s = dispatch(initialState, { type: ACTIONS.TOGGLE_ANGLE });
    s = dispatch(s, { type: ACTIONS.CLEAR });
    expect(s.angleMode).toBe('rad');
  });
});

describe('INSERT_CONSTANT', () => {
  it('inserts π', () => {
    const s = dispatch(initialState, { type: ACTIONS.INSERT_CONSTANT, constant: 'π' });
    expect(parseFloat(s.current)).toBeCloseTo(Math.PI, 10);
  });

  it('inserts e', () => {
    const s = dispatch(initialState, { type: ACTIONS.INSERT_CONSTANT, constant: 'e' });
    expect(parseFloat(s.current)).toBeCloseTo(Math.E, 10);
  });

  it('sets overwrite so next digit starts fresh', () => {
    const s = dispatch(initialState, { type: ACTIONS.INSERT_CONSTANT, constant: 'π' });
    expect(s.overwrite).toBe(true);
  });
});

describe('xʸ operator', () => {
  it('2^10 = 1024', () => {
    let s = typeDigits('2');
    s = dispatch(s, { type: ACTIONS.CHOOSE_OPERATION, operator: 'xʸ' });
    s = typeDigits('10', s);
    s = dispatch(s, { type: ACTIONS.EVALUATE });
    expect(s.current).toBe('1024');
  });
});

describe('y√x operator', () => {
  it('2nd root of 9 = 3', () => {
    let s = typeDigits('2');
    s = dispatch(s, { type: ACTIONS.CHOOSE_OPERATION, operator: 'y√x' });
    s = typeDigits('9', s);
    s = dispatch(s, { type: ACTIONS.EVALUATE });
    expect(parseFloat(s.current)).toBeCloseTo(3, 10);
  });
});

describe('Memory', () => {
  it('starts at 0', () => {
    expect(initialState.memory).toBe('0');
  });

  it('M+ adds current to memory', () => {
    let s = typeDigits('5');
    s = dispatch(s, { type: ACTIONS.MEMORY_ADD });
    expect(s.memory).toBe('5');
  });

  it('M+ accumulates', () => {
    let s = typeDigits('3');
    s = dispatch(s, { type: ACTIONS.MEMORY_ADD });
    s = dispatch(s, { type: ACTIONS.CLEAR });
    s = typeDigits('4', s);
    s = dispatch(s, { type: ACTIONS.MEMORY_ADD });
    expect(s.memory).toBe('7');
  });

  it('M- subtracts current from memory', () => {
    let s = typeDigits('10');
    s = dispatch(s, { type: ACTIONS.MEMORY_ADD });
    s = dispatch(s, { type: ACTIONS.CLEAR });
    s = typeDigits('3', s);
    s = dispatch(s, { type: ACTIONS.MEMORY_SUB });
    expect(s.memory).toBe('7');
  });

  it('MR recalls memory to current', () => {
    let s = typeDigits('42');
    s = dispatch(s, { type: ACTIONS.MEMORY_ADD });
    s = dispatch(s, { type: ACTIONS.CLEAR });
    s = dispatch(s, { type: ACTIONS.MEMORY_RECALL });
    expect(s.current).toBe('42');
  });

  it('MC clears memory', () => {
    let s = typeDigits('99');
    s = dispatch(s, { type: ACTIONS.MEMORY_ADD });
    s = dispatch(s, { type: ACTIONS.MEMORY_CLEAR });
    expect(s.memory).toBe('0');
  });

  it('memory survives CLEAR', () => {
    let s = typeDigits('7');
    s = dispatch(s, { type: ACTIONS.MEMORY_ADD });
    s = dispatch(s, { type: ACTIONS.CLEAR });
    expect(s.memory).toBe('7');
  });
});
