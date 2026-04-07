const FORMATTER = new Intl.NumberFormat('en-US');

export function formatNumber(value: string, precision: number = 10): string {
  if (!value || value === 'Error') return value;
  if (value.includes('e')) return value; // scientific notation mid-input — show as-is

  const [intPart, decPart] = value.split('.');
  const formatted = FORMATTER.format(Number(intPart));

  if (decPart !== undefined) {
    const trimmed = decPart.slice(0, precision);
    return trimmed.length ? `${formatted}.${trimmed}` : formatted;
  }
  return formatted;
}
