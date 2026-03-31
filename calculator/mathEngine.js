import Big from 'big.js';

export function applyScientific(current, fn) {
  try {
    const n = parseFloat(current);
    const big = new Big(current);
    switch (fn) {
      case 'sin':  return new Big(Math.sin((n * Math.PI) / 180)).toFixed();
      case 'cos':  return new Big(Math.cos((n * Math.PI) / 180)).toFixed();
      case 'tan':  return new Big(Math.tan((n * Math.PI) / 180)).toFixed();
      case 'log':  return n <= 0 ? 'Error' : new Big(Math.log10(n)).toFixed();
      case 'ln':   return n <= 0 ? 'Error' : new Big(Math.log(n)).toFixed();
      case '√':    return big.lt(0) ? 'Error' : new Big(Math.sqrt(n)).toFixed();
      case 'x²':   return big.times(big).toFixed();
      case '1/x':  return big.eq(0) ? 'Error' : new Big(1).div(big).toFixed();
      default:     return 'Error';
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
      case '+': return a.plus(b).toFixed();
      case '-': return a.minus(b).toFixed();
      case '×': return a.times(b).toFixed();
      case '÷':
        if (b.eq(0)) return 'Error';
        return a.div(b).toFixed();
      default:
        return current;
    }
  } catch {
    return 'Error';
  }
}