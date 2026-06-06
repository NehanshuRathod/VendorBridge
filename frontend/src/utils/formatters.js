export const shortId = (value, length = 8) => {
  if (!value) return '-';
  return String(value).slice(0, length);
};

export const formatDate = (value) => {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';
  return date.toLocaleDateString();
};

export const formatMoney = (value) => {
  const amount = Number(value ?? 0);
  if (!Number.isFinite(amount)) return '0';
  return amount.toLocaleString('en-IN', { maximumFractionDigits: 2 });
};

export const formatEnum = (value, fallback = '-') => {
  if (!value) return fallback;
  return String(value).replace(/_/g, ' ');
};

export const safeText = (value, fallback = '-') => {
  if (value === null || value === undefined || value === '') return fallback;
  return String(value);
};
