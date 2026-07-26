export function sanitizeIsbn(rawValue?: string) {
  const trimmed = (rawValue ?? '').trim().replace(/[^0-9Xx]/g, '').toUpperCase();

  if (trimmed.length === 10 || trimmed.length === 13) {
    return trimmed;
  }

  if (trimmed.length > 13) {
    const possibleIsbn13 = trimmed.slice(-13);
    if (possibleIsbn13.length === 13) {
      return possibleIsbn13;
    }
  }

  return trimmed;
}

export function isValidIsbnLength(value: string) {
  return value.length === 10 || value.length === 13;
}
