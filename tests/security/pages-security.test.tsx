import { render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { expectNoA11yViolations } from '@/tests/helpers/a11y';

const mockReader = {
  singletons: {
    profile: {
      read: vi.fn(),
    },
  },
  collections: {
    projects: {
      all: vi.fn(),
      read: vi.fn(),
    },
    posts: {
      all: vi.fn(),
      read: vi.fn(),
    },
    updates: {
      all: vi.fn(),
    },
  },
};

vi.mock('@/lib/keystatic', () => ({
  reader: mockReader,
}));

vi.mock('@/components/git-activity', () => ({
  GitActivity: ({ username }: { username?: string }) => (
    <div data-testid="git-activity">Git stream for {username}</div>
  ),
}));

describe('Public pages security & accessibility in production', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.clearAllMocks();
  });

  it('HomePage hides all /keystatic admin links when empty in production and passes WCAG 2.1 AA', async () => {
    vi.stubEnv('NODE_ENV', 'production');
    mockReader.singletons.profile.read.mockResolvedValue({
      name: 'Kevin',
      role: 'Full Stack Developer',
      githubUsername: 'Alke-14',
      intro: 'Building accessible web apps.',
      skills: [],
    });
    mockReader.collections.projects.all.mockResolvedValue([]);
    mockReader.collections.posts.all.mockResolvedValue([]);
    mockReader.collections.updates.all.mockResolvedValue([]);

    const { default: HomePage } = await import('@/app/page');
    const element = await HomePage();
    const { container } = render(element);

    const adminLinks = screen
      .queryAllByRole('link')
      .filter((el) => el.getAttribute('href')?.startsWith('/keystatic'));
    expect(adminLinks).toHaveLength(0);

    await expectNoA11yViolations(container);
  });

  it('HomePage sanitizes CMS project URLs and enforces rel=noopener noreferrer', async () => {
    vi.stubEnv('NODE_ENV', 'production');
    mockReader.singletons.profile.read.mockResolvedValue({
      name: 'Kevin',
      role: 'Developer',
      githubUsername: 'Alke-14',
      intro: 'Intro',
      skills: [],
    });
    mockReader.collections.projects.all.mockResolvedValue([
      {
        slug: 'test-proj',
        entry: {
          title: 'Test Project',
          description: 'Desc',
          year: '2026',
          featured: true,
          github: 'javascript:alert(1)',
          link: 'https://example.com',
          tech: ['TypeScript'],
          content: vi.fn(),
        },
      },
    ]);
    mockReader.collections.posts.all.mockResolvedValue([]);
    mockReader.collections.updates.all.mockResolvedValue([]);

    const { default: HomePage } = await import('@/app/page');
    const element = await HomePage();
    const { container } = render(element);

    for (const link of container.querySelectorAll('a')) {
      expect(link.getAttribute('href') ?? '').not.toMatch(/^javascript:/i);
    }

    const liveLink = screen.getByRole('link', { name: /live/i });
    expect(liveLink).toHaveAttribute('href', 'https://example.com');
    expect(liveLink).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('ProjectsPage, WritingPage, and UpdatesPage hide /keystatic links in production when empty and sanitize CMS URLs', async () => {
    vi.stubEnv('NODE_ENV', 'production');
    mockReader.collections.projects.all.mockResolvedValue([]);
    mockReader.collections.posts.all.mockResolvedValue([]);
    mockReader.collections.updates.all.mockResolvedValue([
      {
        slug: 'unsafe-update',
        entry: {
          title: 'Update',
          date: '2026-01-01',
          category: 'work',
          detail: 'Details',
          link: 'javascript:alert(2)',
        },
      },
    ]);

    const { default: ProjectsPage } = await import('@/app/projects/page');
    const { default: WritingPage } = await import('@/app/writing/page');
    const { default: UpdatesPage } = await import('@/app/updates/page');

    for (const PageComponent of [ProjectsPage, WritingPage]) {
      const el = await PageComponent();
      const { container, unmount } = render(el);
      const adminLinks = screen
        .queryAllByRole('link')
        .filter((link) => link.getAttribute('href')?.startsWith('/keystatic'));
      expect(adminLinks).toHaveLength(0);
      await expectNoA11yViolations(container);
      unmount();
    }

    const updatesEl = await UpdatesPage();
    const { container: updatesContainer } = render(updatesEl);
    for (const link of updatesContainer.querySelectorAll('a')) {
      expect(link.getAttribute('href') ?? '').not.toMatch(/^javascript:/i);
    }
    await expectNoA11yViolations(updatesContainer);
  });
});
