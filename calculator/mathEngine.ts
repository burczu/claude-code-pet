import Big from 'big.js';

export type AngleMode = 'deg' | 'rad';
export type Operator = '+' | '-' | '×' | '÷' | 'xʸ' | 'y√x';
export type ScientificFn =
  | 'sin'
  | 'cos'
  | 'tan'
  | 'asin'
  | 'acos'
  | 'atan'
  | 'sinh'
  | 'cosh'
  | 'tanh'
  | 'asinh'
  | 'acosh'
  | 'atanh'
  | 'x²'
  | 'x³'
  | '√'
  | '³√'
  | 'eˣ'
  | '10ˣ'
  | 'ln'
  | 'log'
  | '1/x'
  | 'x!'
  | 'Rand';

export type TokenType = 'number' | 'op' | 'paren';
export interface Token {
  type: TokenType;
  value: string;
}

type RpnItem = string | { op: string };

const DEG_TO_RAD = Math.PI / 180;
const RAD_TO_DEG = 180 / Math.PI;
const MAX_FACTORIAL = 170;
const FACTORIAL_TOLERANCE = 1e-9;

function toRad(n: number, angleMode: AngleMode): number {
  return angleMode === 'deg' ? n * DEG_TO_RAD : n;
}

function fromRad(n: number, angleMode: AngleMode): number {
  return angleMode === 'deg' ? n * RAD_TO_DEG : n;
}

function factorial(n: number): number {
  if (n < 0 || !Number.isInteger(n) || n > MAX_FACTORIAL) throw new Error('Invalid');
  let result = 1;
  for (let i = 2; i <= n; i++) result *= i;
  return result;
}

export function applyScientific(
  current: string,
  fn: ScientificFn,
  angleMode: AngleMode = 'deg',
): string {
  try {
    const n = parseFloat(current);
    const big = new Big(current);

    switch (fn) {
      // Trig
      case 'sin':
        return new Big(Math.sin(toRad(n, angleMode))).toFixed();
      case 'cos':
        return new Big(Math.cos(toRad(n, angleMode))).toFixed();
      case 'tan':
        return new Big(Math.tan(toRad(n, angleMode))).toFixed();
      case 'asin':
        return Math.abs(n) > 1 ? 'Error' : new Big(fromRad(Math.asin(n), angleMode)).toFixed();
      case 'acos':
        return Math.abs(n) > 1 ? 'Error' : new Big(fromRad(Math.acos(n), angleMode)).toFixed();
      case 'atan':
        return new Big(fromRad(Math.atan(n), angleMode)).toFixed();

      // Hyperbolic
      case 'sinh':
        return new Big(Math.sinh(n)).toFixed();
      case 'cosh':
        return new Big(Math.cosh(n)).toFixed();
      case 'tanh':
        return new Big(Math.tanh(n)).toFixed();
      case 'asinh':
        return new Big(Math.asinh(n)).toFixed();
      case 'acosh':
        return n < 1 ? 'Error' : new Big(Math.acosh(n)).toFixed();
      case 'atanh':
        return Math.abs(n) >= 1 ? 'Error' : new Big(Math.atanh(n)).toFixed();

      // Powers & roots
      case 'x²':
        return big.times(big).toFixed();
      case 'x³':
        return big.times(big).times(big).toFixed();
      case '√':
        return big.lt(0) ? 'Error' : new Big(Math.sqrt(n)).toFixed();
      case '³√':
        return new Big(Math.cbrt(n)).toFixed();
      case 'eˣ':
        return new Big(Math.exp(n)).toFixed();
      case '10ˣ': {
        const r = Math.pow(10, n);
        return isFinite(r) ? new Big(r).toFixed() : 'Error';
      }
      case 'ln':
        return n <= 0 ? 'Error' : new Big(Math.log(n)).toFixed();
      case 'log':
        return n <= 0 ? 'Error' : new Big(Math.log10(n)).toFixed();
      case '1/x':
        return big.eq(0) ? 'Error' : new Big(1).div(big).toFixed();

      // Misc
      case 'x!': {
        const int = Math.round(n);
        if (n < 0 || Math.abs(n - int) > FACTORIAL_TOLERANCE) return 'Error';
        return new Big(factorial(int)).toFixed();
      }
      case 'Rand':
        return String(Math.random());
    }
  } catch {
    return 'Error';
  }
}

// Operator precedence and associativity for shunting-yard
const PREC: Record<string, number> = { '+': 1, '-': 1, '×': 2, '÷': 2, xʸ: 3, 'y√x': 3 };
const RIGHT_ASSOC = new Set(['xʸ']);

function applyOp(a: Big, b: Big, op: string): Big {
  switch (op) {
    case '+':
      return a.plus(b);
    case '-':
      return a.minus(b);
    case '×':
      return a.times(b);
    case '÷': {
      if (b.eq(0)) throw new Error('div0');
      return a.div(b);
    }
    case 'xʸ': {
      const r = Math.pow(a.toNumber(), b.toNumber());
      if (!isFinite(r)) throw new Error();
      return new Big(r);
    }
    case 'y√x': {
      if (a.eq(0)) throw new Error();
      const r = Math.pow(b.toNumber(), 1 / a.toNumber());
      if (!isFinite(r) || isNaN(r)) throw new Error();
      return new Big(r);
    }
    default:
      throw new Error('unknown op');
  }
}

// Evaluate a token list [{type:'number'|'op'|'paren', value:string}] using shunting-yard.
export function evaluateTokens(tokens: Token[]): string {
  try {
    const output: RpnItem[] = []; // postfix queue
    const ops: string[] = []; // operator stack

    for (const tok of tokens) {
      if (tok.type === 'number') {
        output.push(tok.value);
      } else if (tok.type === 'op') {
        while (
          ops.length &&
          ops[ops.length - 1] !== '(' &&
          (PREC[ops[ops.length - 1]!]! > PREC[tok.value]! ||
            (PREC[ops[ops.length - 1]!] === PREC[tok.value] && !RIGHT_ASSOC.has(tok.value)))
        ) {
          output.push({ op: ops.pop()! });
        }
        ops.push(tok.value);
      } else if (tok.value === '(') {
        ops.push('(');
      } else if (tok.value === ')') {
        while (ops.length && ops[ops.length - 1] !== '(') output.push({ op: ops.pop()! });
        ops.pop(); // discard '('
      }
    }
    while (ops.length) output.push({ op: ops.pop()! });

    // Evaluate RPN — numbers are strings, operators are { op: string }
    const stack: Big[] = [];
    for (const item of output) {
      if (typeof item === 'string') {
        stack.push(new Big(item));
      } else {
        const b = stack.pop()!;
        const a = stack.pop()!;
        stack.push(applyOp(a, b, item.op));
      }
    }

    if (stack.length !== 1) return 'Error';
    return stack[0]!.toFixed();
  } catch {
    return 'Error';
  }
}

export function evaluate(previous: string, current: string, operator: string): string {
  try {
    const a = new Big(previous);
    const b = new Big(current);

    switch (operator) {
      case '+':
        return a.plus(b).toFixed();
      case '-':
        return a.minus(b).toFixed();
      case '×':
        return a.times(b).toFixed();
      case '÷':
        return b.eq(0) ? 'Error' : a.div(b).toFixed();
      case 'xʸ': {
        const r = Math.pow(a.toNumber(), b.toNumber());
        return isFinite(r) ? new Big(r).toFixed() : 'Error';
      }
      case 'y√x': {
        if (a.eq(0)) return 'Error';
        const r = Math.pow(b.toNumber(), 1 / a.toNumber());
        return isFinite(r) && !isNaN(r) ? new Big(r).toFixed() : 'Error';
      }
      default:
        return current;
    }
  } catch {
    return 'Error';
  }
}
