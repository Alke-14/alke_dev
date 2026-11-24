import { afterEach, describe, expect, it, vi } from 'vitest';

describe('Keystatic API route fail-closed guard', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  it('returns 503 in production when any GitHub OAuth or session secret env var is missing', async () => {
    const partialEnvSets = [
      { id: '', secret: '', session: '' },
      { id: 'client-id', secret: '', session: 'session-secret' },
      { id: '', secret: 'client-secret', session: 'session-secret' },
      { id: 'client-id', secret: 'client-secret', session: '' },
      { id: '   ', secret: 'client-secret', session: 'session-secret' },
    ];

    for (const env of partialEnvSets) {
      vi.stubEnv('NODE_ENV', 'production');
      vi.stubEnv('KEYSTATIC_GITHUB_CLIENT_ID', env.id);
      vi.stubEnv('KEYSTATIC_GITHUB_CLIENT_SECRET', env.secret);
      vi.stubEnv('KEYSTATIC_SECRET', env.session);
      vi.resetModules();

      const { GET, POST } = await import('@/app/api/keystatic/[...params]/route');

      const getRes = await GET(new Request('https://alke.dev/api/keystatic/tree'));
      expect(getRes.status).toBe(503);
      expect(getRes.headers.get('cache-control')).toContain('no-store');

      const postRes = await POST(
        new Request('https://alke.dev/api/keystatic/update', { method: 'POST' })
      );
      expect(postRes.status).toBe(503);
    }
  });

  it('delegates to Keystatic handler in production once all GitHub OAuth env vars are present', async () => {
    vi.stubEnv('NODE_ENV', 'production');
    vi.stubEnv('KEYSTATIC_GITHUB_CLIENT_ID', 'test-client-id');
    vi.stubEnv('KEYSTATIC_GITHUB_CLIENT_SECRET', 'test-client-secret');
    vi.stubEnv('KEYSTATIC_SECRET', 'test-keystatic-secret-at-least-32-chars-long');
    vi.resetModules();

    const { GET } = await import('@/app/api/keystatic/[...params]/route');
    const res = await GET(new Request('https://alke.dev/api/keystatic/github/login'));
    expect(res.status).not.toBe(503);
  });
});
