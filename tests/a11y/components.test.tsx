import Markdoc from '@markdoc/markdoc';
import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { DocumentRenderer } from '@/components/document-renderer';
import { ThemeProvider } from '@/components/theme-provider';
import { ThemeToggle } from '@/components/theme-toggle';
import Navbar from '@/components/ui/navbar';
import { expectNoA11yViolations } from '@/tests/helpers/a11y';

let mockPathname = '/';
const mockSetTheme = vi.fn();

vi.mock('next/navigation', () => ({
  usePathname: () => mockPathname,
}));

vi.mock('next-themes', () => ({
  ThemeProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  useTheme: () => ({
    resolvedTheme: 'dark',
    setTheme: mockSetTheme,
  }),
}));

describe('Accessibility & UI security visibility', () => {
  afterEach(() => {
    mockPathname = '/';
    mockSetTheme.mockReset();
    vi.unstubAllEnvs();
  });

  it('Navbar passes WCAG 2.1 AA checks in closed and mobile-expanded states and closes on Escape', async () => {
    vi.stubEnv('NODE_ENV', 'development');
    const user = userEvent.setup();

    const { container } = render(<Navbar />);
    await expectNoA11yViolations(container);

    const toggleButton = screen.getByRole('button', { name: /open navigation menu/i });
    expect(toggleButton).toHaveAttribute('aria-expanded', 'false');
    expect(toggleButton).toHaveAttribute('aria-controls', 'mobile-nav');

    await user.click(toggleButton);
    expect(toggleButton).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByRole('navigation', { name: 'Mobile' })).toBeInTheDocument();
    await expectNoA11yViolations(container);

    await user.keyboard('{Escape}');
    expect(toggleButton).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryByRole('navigation', { name: 'Mobile' })).not.toBeInTheDocument();
  });

  it('Navbar hides /keystatic admin links in production and renders nothing inside /keystatic', () => {
    vi.stubEnv('NODE_ENV', 'production');
    const { rerender, container } = render(<Navbar />);

    const keystaticLinks = screen
      .queryAllByRole('link')
      .filter((el) => el.getAttribute('href') === '/keystatic');
    expect(keystaticLinks).toHaveLength(0);

    mockPathname = '/keystatic/collection/projects';
    rerender(<Navbar />);
    expect(container).toBeEmptyDOMElement();
  });

  it('ThemeHotkey toggles theme with d outside inputs, but ignores inputs and /keystatic', () => {
    render(
      <ThemeProvider>
        <input aria-label="Search" />
      </ThemeProvider>
    );

    const input = screen.getByRole('textbox', { name: 'Search' });
    fireEvent.keyDown(input, { key: 'd' });
    expect(mockSetTheme).not.toHaveBeenCalled();

    fireEvent.keyDown(document.body, { key: 'd' });
    expect(mockSetTheme).toHaveBeenCalledWith('light');
  });

  it('ThemeToggle passes WCAG 2.1 AA checks', async () => {
    const { container } = render(<ThemeToggle />);
    const button = screen.getByRole('button', { name: /toggle theme/i });
    expect(button).toBeInTheDocument();
    await expectNoA11yViolations(container);
  });

  it('DocumentRenderer passes WCAG 2.1 AA checks for structured Markdoc content', async () => {
    const ast = Markdoc.parse(`## Architecture

- Next.js App Router
- Keystatic CMS

\`\`\`ts
export const ready = true;
\`\`\`

See [Projects](/projects).`);

    const { container } = render(<DocumentRenderer node={ast} />);
    await expectNoA11yViolations(container);
  });
});
