import { afterEach, describe, expect, it, vi } from 'vitest';
import { unstable_doesMiddlewareMatch } from 'next/experimental/testing/server';
import { NextRequest } from 'next/server';
import nextConfig from '@/next.config';
import { config, proxy } from '@/proxy';

function basicAuthHeader(user: string, pass: string): string {
  return `Basic ${Buffer.from(`${user}:${pass}`).toString('base64')}`;
}

describe('Admin access proxy (fail-closed in production)', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('targets /keystatic and /api/keystatic routes in matcher config and skips public routes', () => {
    expect(config.matcher).toEqual(
      expect.arrayContaining(['/keystatic/:path*', '/api/keystatic/:path*'])
    );

    expect(unstable_doesMiddlewareMatch({ config, nextConfig, url: '/keystatic' })).toBe(true);
    expect(
      unstable_doesMiddlewareMatch({ config, nextConfig, url: '/keystatic/collection/projects' })
    ).toBe(true);
    expect(unstable_doesMiddlewareMatch({ config, nextConfig, url: '/api/keystatic/tree' })).toBe(
      true
    );
    expect(
      unstable_doesMiddlewareMatch({
        config,
        nextConfig,
        url: '/api/keystatic/github/oauth/callback?code=abc',
      })
    ).toBe(true);

    expect(unstable_doesMiddlewareMatch({ config, nextConfig, url: '/' })).toBe(false);
    expect(unstable_doesMiddlewareMatch({ config, nextConfig, url: '/projects' })).toBe(false);
    expect(unstable_doesMiddlewareMatch({ config, nextConfig, url: '/writing' })).toBe(false);
    expect(unstable_doesMiddlewareMatch({ config, nextConfig, url: '/updates' })).toBe(false);
  });

  it('fails closed with 503 in production when admin credentials are missing or whitespace-only', async () => {
    vi.stubEnv('NODE_ENV', 'production');

    const incompletePairs: Array<[string, string]> = [
      ['', ''],
      ['   ', 'valid-pass'],
      ['alke', '   '],
      ['alke', ''],
      ['', 'valid-pass'],
    ];

    for (const [user, pass] of incompletePairs) {
      vi.stubEnv('KEYSTATIC_ADMIN_USER', user);
      vi.stubEnv('KEYSTATIC_ADMIN_PASSWORD', pass);

      for (const path of ['/keystatic', '/keystatic/', '/keystatic/collection/projects', '/api/keystatic/tree']) {
        const req = new NextRequest(`https://alke.dev${path}`);
        const res = await proxy(req);
        expect(res.status).toBe(503);
        expect(res.headers.get('cache-control')).toContain('no-store');
        expect(res.headers.get('x-robots-tag')).toBe('noindex, nofollow');
      }
    }
  });

  it('returns 401 with Basic challenge in production when Authorization header is missing', async () => {
    vi.stubEnv('NODE_ENV', 'production');
    vi.stubEnv('KEYSTATIC_ADMIN_USER', 'alke');
    vi.stubEnv('KEYSTATIC_ADMIN_PASSWORD', 's3cr3t-passphrase');

    for (const method of ['GET', 'POST', 'PUT', 'DELETE', 'PATCH']) {
      const req = new NextRequest('https://alke.dev/api/keystatic/tree?ref=main', { method });
      const res = await proxy(req);

      expect(res.status).toBe(401);
      expect(res.headers.get('www-authenticate')).toContain('Basic');
      expect(res.headers.get('cache-control')).toContain('no-store');
      expect(res.headers.get('x-robots-tag')).toBe('noindex, nofollow');
    }
  });

  it('returns 401 in production for invalid credentials, length mismatches, or malformed auth headers', async () => {
    vi.stubEnv('NODE_ENV', 'production');
    vi.stubEnv('KEYSTATIC_ADMIN_USER', 'alke');
    vi.stubEnv('KEYSTATIC_ADMIN_PASSWORD', 's3cr3t-passphrase');

    const badHeaders = [
      basicAuthHeader('alke', 'wrong-password'),
      basicAuthHeader('alke', 's3cr3t-passphras'),
      basicAuthHeader('alke', 's3cr3t-passphrase-extra'),
      basicAuthHeader('other-user', 's3cr3t-passphrase'),
      basicAuthHeader('', 's3cr3t-passphrase'),
      basicAuthHeader('alke', ''),
      'Bearer some-token',
      'Basic',
      'Basic ',
      'Basic !!!invalid-base64!!!',
      `Basic ${Buffer.from('no-colon-separator').toString('base64')}`,
    ];

    for (const auth of badHeaders) {
      const req = new NextRequest('https://alke.dev/api/keystatic/tree', {
        headers: { authorization: auth },
      });
      const res = await proxy(req);
      expect(res.status).toBe(401);
    }
  });

  it('allows valid admin Basic Auth in production and marks response noindex + no-store', async () => {
    vi.stubEnv('NODE_ENV', 'production');
    vi.stubEnv('KEYSTATIC_ADMIN_USER', 'alke');
    vi.stubEnv('KEYSTATIC_ADMIN_PASSWORD', 's3cr3t-passphrase');

    const req = new NextRequest('https://alke.dev/keystatic/collection/projects?view=edit', {
      headers: {
        authorization: basicAuthHeader('alke', 's3cr3t-passphrase'),
      },
    });
    const res = await proxy(req);

    expect(res.status).toBe(200);
    expect(res.headers.get('x-middleware-next')).toBe('1');
    expect(res.headers.get('x-robots-tag')).toBe('noindex, nofollow');
    expect(res.headers.get('cache-control')).toContain('no-store');
  });

  it('accepts case-insensitive Basic scheme and passwords containing colons', async () => {
    vi.stubEnv('NODE_ENV', 'production');
    vi.stubEnv('KEYSTATIC_ADMIN_USER', 'alke');
    vi.stubEnv('KEYSTATIC_ADMIN_PASSWORD', 'part1:part2:part3');

    const token = Buffer.from('alke:part1:part2:part3').toString('base64');
    const req = new NextRequest('https://alke.dev/keystatic', {
      headers: {
        authorization: `basic ${token}`,
      },
    });
    const res = await proxy(req);

    expect(res.status).toBe(200);
    expect(res.headers.get('x-middleware-next')).toBe('1');
  });

  it('allows public routes without auth even in production', async () => {
    vi.stubEnv('NODE_ENV', 'production');
    vi.stubEnv('KEYSTATIC_ADMIN_USER', '');
    vi.stubEnv('KEYSTATIC_ADMIN_PASSWORD', '');

    for (const path of ['/', '/projects', '/writing', '/updates']) {
      const req = new NextRequest(`https://alke.dev${path}`);
      const res = await proxy(req);
      expect(res.status).toBe(200);
      expect(res.headers.get('x-middleware-next')).toBe('1');
    }
  });

  it('allows /keystatic in development without Basic Auth for local CMS workflow', async () => {
    vi.stubEnv('NODE_ENV', 'development');

    const req = new NextRequest('http://localhost:3000/keystatic');
    const res = await proxy(req);

    expect(res.status).toBe(200);
    expect(res.headers.get('x-middleware-next')).toBe('1');
  });
});
