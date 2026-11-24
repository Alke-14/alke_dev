import { describe, expect, it } from 'vitest';
import nextConfig from '@/next.config';

describe('Next.js HTTP security headers', () => {
  it('configures baseline clickjacking, MIME, referrer, and permissions headers for all routes', async () => {
    expect(typeof nextConfig.headers).toBe('function');

    const headerRules = await nextConfig.headers!();
    const globalRule = headerRules.find((rule) => rule.source === '/(.*)');

    expect(globalRule).toBeDefined();

    const headerMap = new Map(
      globalRule!.headers.map((h) => [h.key.toLowerCase(), h.value])
    );

    expect(headerMap.get('x-frame-options')).toBe('DENY');
    expect(headerMap.get('x-content-type-options')).toBe('nosniff');
    expect(headerMap.get('referrer-policy')).toBe('strict-origin-when-cross-origin');
    expect(headerMap.get('permissions-policy')).toContain('camera=()');
    expect(headerMap.get('permissions-policy')).toContain('microphone=()');
    expect(headerMap.get('permissions-policy')).toContain('geolocation=()');
  });
});
