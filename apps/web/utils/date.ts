export function getLocale() {
  return Intl.NumberFormat().resolvedOptions().locale;
}

export function formatDate(input: Date | string | number, short = false) {
  const date = new Date(input);

  return date.toLocaleDateString(getLocale(), {
    year: 'numeric',
    month: short ? 'numeric' : 'long',
    day: 'numeric',
  });
}
