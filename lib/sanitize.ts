const SAFE_PROTOCOLS = new Set(['http:', 'https:', 'mailto:']);

function hasControlChars(value: string): boolean {
  for (let i = 0; i < value.length; i += 1) {
    const code = value.charCodeAt(i);
    if (code <= 0x1f || code === 0x7f) {
      return true;
    }
  }
  return false;
}

export function sanitizeHref(rawHref: unknown): string | null {
  if (typeof rawHref !== 'string') return null;
  if (hasControlChars(rawHref)) return null;

  const trimmed = rawHref.trim();
  if (!trimmed) return null;

  // Reject protocol-relative URLs (e.g. //evil.example)
  if (trimmed.startsWith('//') || trimmed.startsWith('/\\')) {
    return null;
  }

  // Allow safe internal path or fragment references
  if (trimmed.startsWith('/') || trimmed.startsWith('#')) {
    return trimmed;
  }

  try {
    const parsed = new URL(trimmed);
    if (!SAFE_PROTOCOLS.has(parsed.protocol)) {
      return null;
    }
    return trimmed;
  } catch {
    return null;
  }
}
