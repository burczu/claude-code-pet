const formatter = new Intl.NumberFormat('en-US');

export function formatNumber(value) {
  if (!value || value === 'Error') return value;

  const [intPart, decPart] = value.split('.');
  const formatted = formatter.format(Number(intPart));

  if (decPart !== undefined) return `${formatted}.${decPart}`;
  return formatted;
}