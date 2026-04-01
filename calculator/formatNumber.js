const FORMATTER = new Intl.NumberFormat('en-US');

export function formatNumber(value, precision = 10) {
  if (!value || value === 'Error') return value;

  const [intPart, decPart] = value.split('.');
  const formatted = FORMATTER.format(Number(intPart));

  if (decPart !== undefined) {
    const trimmed = decPart.slice(0, precision);
    return trimmed.length ? `${formatted}.${trimmed}` : formatted;
  }
  return formatted;
}