import { render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { GitActivity } from '@/components/git-activity';

describe('GitActivity hardening', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('rejects invalid GitHub usernames without making outbound fetch requests', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch');

    const element = await GitActivity({ username: 'Alke-14/../../repos?foo=bar' });
    render(element);

    expect(fetchSpy).not.toHaveBeenCalled();
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
  });

  it('fetches GitHub events with AbortSignal timeout for valid usernames', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify([]), {
        status: 200,
        headers: { 'content-type': 'application/json' },
      })
    );

    const element = await GitActivity({ username: 'Alke-14' });
    render(element);

    expect(fetchSpy).toHaveBeenCalledTimes(1);
    const [url, init] = fetchSpy.mock.calls[0];
    expect(url).toBe('https://api.github.com/users/Alke-14/events/public?per_page=6');
    expect(init?.signal).toBeInstanceOf(AbortSignal);
  });

  it('renders fallback gracefully when GitHub fetch rejects or times out', async () => {
    vi.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('TimeoutError'));

    const element = await GitActivity({ username: 'Alke-14' });
    render(element);

    expect(
      screen.getByText(/Git activity will sync from your public GitHub profile/i)
    ).toBeInTheDocument();
  });
});
