/**
 * Indian Rupee (INR ₹) Formatting Utilities
 */

export function formatINR(amount, includeSymbol = true) {
  const num = typeof amount === 'number' ? amount : parseFloat(amount) || 0;
  const formatted = num.toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
  return includeSymbol ? `₹${formatted}` : formatted;
}

export function formatINRCompact(amount) {
  const num = typeof amount === 'number' ? amount : parseFloat(amount) || 0;
  if (num >= 10000000) {
    return `₹${(num / 10000000).toFixed(2)} Cr`;
  }
  if (num >= 100000) {
    return `₹${(num / 100000).toFixed(2)} L`;
  }
  return formatINR(num);
}
