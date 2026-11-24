import { afterEach, describe, expect, it, vi } from 'vitest';

describe('keystatic.config storage mode security', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  it('never falls back to unauthenticated local storage in production', async () => {
    vi.stubEnv('NODE_ENV', 'production');
    vi.stubEnv('NEXT_PUBLIC_KEYSTATIC_GITHUB_REPO_OWNER', '');
    vi.stubEnv('NEXT_PUBLIC_KEYSTATIC_GITHUB_REPO_NAME', '');
    vi.stubEnv('KEYSTATIC_GITHUB_REPO_OWNER', '');
    vi.stubEnv('KEYSTATIC_GITHUB_REPO_NAME', '');
    vi.resetModules();

    const { default: keystaticConfig } = await import('@/keystatic.config');
    expect(keystaticConfig.storage.kind).toBe('github');
    if (keystaticConfig.storage.kind === 'github') {
      expect(keystaticConfig.storage.repo).toBe('Alke-14/alke_dev');
    }
  });

  it('uses NEXT_PUBLIC_KEYSTATIC_GITHUB_REPO_* in production so client and server match', async () => {
    vi.stubEnv('NODE_ENV', 'production');
    vi.stubEnv('NEXT_PUBLIC_KEYSTATIC_GITHUB_REPO_OWNER', 'Alke-14');
    vi.stubEnv('NEXT_PUBLIC_KEYSTATIC_GITHUB_REPO_NAME', 'alke_dev');
    vi.resetModules();

    const { default: keystaticConfig } = await import('@/keystatic.config');
    expect(keystaticConfig.storage).toEqual({
      kind: 'github',
      repo: 'Alke-14/alke_dev',
    });
  });

  it('uses local storage in development', async () => {
    vi.stubEnv('NODE_ENV', 'development');
    vi.resetModules();

    const { default: keystaticConfig } = await import('@/keystatic.config');
    expect(keystaticConfig.storage).toEqual({ kind: 'local' });
  });
});
