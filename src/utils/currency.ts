export const formatCurrency = (amount: number, includeSymbol = true): string => {
  if (isNaN(amount) || amount === null || amount === undefined) {
    return includeSymbol ? '₹0' : '0';
  }

  // Format using Indian Numbering system
  const rounded = Math.round(amount);
  const formatted = new Intl.NumberFormat('en-IN', {
    maximumFractionDigits: 0,
  }).format(rounded);

  return includeSymbol ? `₹${formatted}` : formatted;
};

export const parseNumber = (val: string | number): number => {
  if (typeof val === 'number') return isNaN(val) ? 0 : val;
  const cleaned = val.replace(/[^0-9.-]+/g, '');
  const num = parseFloat(cleaned);
  return isNaN(num) ? 0 : num;
};
