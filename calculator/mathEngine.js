import Big from 'big.js';

const DEG_TO_RAD = Math.PI / 180;
const RAD_TO_DEG = 180 / Math.PI;

function toRad(n, angleMode) {
  return angleMode === 'deg' ? n * DEG_TO_RAD : n;
}

function fromRad(n, angleMode) {
  return angleMode === 'deg' ? n * RAD_TO_DEG : n;
}

function factorial(n) {
  if (n < 0 || !Number.isInteger(n) || n > 170) throw new Error('Invalid');
  let result = 1;
  for (let i = 2; i <= n; i++) result *= i;
  return result;
}

export function applyScientific(current, fn, angleMode = 'deg') {
  try {
    const n = parseFloat(current);
    const big = new Big(current);

    switch (fn) {
      // Trig
      case 'sin':   return new Big(Math.sin(toRad(n, angleMode))).toFixed();
      case 'cos':   return new Big(Math.cos(toRad(n, angleMode))).toFixed();
      case 'tan':   return new Big(Math.tan(toRad(n, angleMode))).toFixed();
      case 'asin':  return Math.abs(n) > 1 ? 'Error' : new Big(fromRad(Math.asin(n), angleMode)).toFixed();
      case 'acos':  return Math.abs(n) > 1 ? 'Error' : new Big(fromRad(Math.acos(n), angleMode)).toFixed();
      case 'atan':  return new Big(fromRad(Math.atan(n), angleMode)).toFixed();

      // Hyperbolic
      case 'sinh':  return new Big(Math.sinh(n)).toFixed();
      case 'cosh':  return new Big(Math.cosh(n)).toFixed();
      case 'tanh':  return new Big(Math.tanh(n)).toFixed();
      case 'asinh': return new Big(Math.asinh(n)).toFixed();
      case 'acosh': return n < 1 ? 'Error' : new Big(Math.acosh(n)).toFixed();
      case 'atanh': return Math.abs(n) >= 1 ? 'Error' : new Big(Math.atanh(n)).toFixed();

      // Powers & roots
      case 'x²':  return big.times(big).toFixed();
      case 'x³':  return big.times(big).times(big).toFixed();
      case '√':   return big.lt(0) ? 'Error' : new Big(Math.sqrt(n)).toFixed();
      case '³√':  return new Big(Math.cbrt(n)).toFixed();
      case 'eˣ':  return new Big(Math.exp(n)).toFixed();
      case '10ˣ': { const r = Math.pow(10, n); return isFinite(r) ? new Big(r).toFixed() : 'Error'; }
      case 'ln':  return n <= 0 ? 'Error' : new Big(Math.log(n)).toFixed();
      case 'log': return n <= 0 ? 'Error' : new Big(Math.log10(n)).toFixed();
      case '1/x': return big.eq(0) ? 'Error' : new Big(1).div(big).toFixed();

      // Misc
      case 'x!': {
        const int = Math.round(n);
        if (n < 0 || Math.abs(n - int) > 1e-9) return 'Error';
        return new Big(factorial(int)).toFixed();
      }
      case 'Rand': return String(Math.random());

      default: return 'Error';
    }
  } catch {
    return 'Error';
  }
}

export function evaluate(previous, current, operator) {
  try {
    const a = new Big(previous);
    const b = new Big(current);

    switch (operator) {
      case '+':   return a.plus(b).toFixed();
      case '-':   return a.minus(b).toFixed();
      case '×':   return a.times(b).toFixed();
      case '÷':   return b.eq(0) ? 'Error' : a.div(b).toFixed();
      case 'xʸ': {
        const r = Math.pow(a.toNumber(), b.toNumber());
        return isFinite(r) ? new Big(r).toFixed() : 'Error';
      }
      case 'y√x': {
        if (a.eq(0)) return 'Error';
        const r = Math.pow(b.toNumber(), 1 / a.toNumber());
        return isFinite(r) && !isNaN(r) ? new Big(r).toFixed() : 'Error';
      }
      default: return current;
    }
  } catch {
    return 'Error';
  }
}