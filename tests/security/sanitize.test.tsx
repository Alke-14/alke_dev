import Markdoc from '@markdoc/markdoc';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { DocumentRenderer, sanitizeHref } from '@/components/document-renderer';

describe('Link sanitization and DocumentRenderer safety', () => {
  it('blocks dangerous URI schemes, control characters, and protocol-relative URLs', () => {
    expect(sanitizeHref('javascript:alert(1)')).toBeNull();
    expect(sanitizeHref('  JaVaScRiPt:alert(document.cookie)')).toBeNull();
    expect(sanitizeHref('java\tscript:alert(1)')).toBeNull();
    expect(sanitizeHref('java\nscript:alert(1)')).toBeNull();
    expect(sanitizeHref('\u0000javascript:alert(1)')).toBeNull();
    expect(sanitizeHref('data:text/html,<script>alert(1)</script>')).toBeNull();
    expect(sanitizeHref('vbscript:msgbox(1)')).toBeNull();
    expect(sanitizeHref('file:///etc/passwd')).toBeNull();
    expect(sanitizeHref('blob:https://alke.dev/123')).toBeNull();
    expect(sanitizeHref('//evil.example.com/phish')).toBeNull();
    expect(sanitizeHref('')).toBeNull();
    expect(sanitizeHref('   ')).toBeNull();
    expect(sanitizeHref(undefined)).toBeNull();
    expect(sanitizeHref(null)).toBeNull();
  });

  it('allows safe http, https, mailto, relative, and anchor links', () => {
    expect(sanitizeHref('https://github.com/Alke-14')).toBe('https://github.com/Alke-14');
    expect(sanitizeHref('http://localhost:3000/projects')).toBe('http://localhost:3000/projects');
    expect(sanitizeHref('mailto:kevin@example.com')).toBe('mailto:kevin@example.com');
    expect(sanitizeHref('/projects/house-rules')).toBe('/projects/house-rules');
    expect(sanitizeHref('#architecture')).toBe('#architecture');
  });

  it('never renders unsafe hrefs in Markdoc output and sets rel=noopener noreferrer', () => {
    const ast = Markdoc.parse(
      '[Evil](javascript:alert(1)) and [ProtoRel](//evil.example) and [GitHub](https://github.com/Alke-14)'
    );

    const { container } = render(<DocumentRenderer node={ast} />);
    const links = container.querySelectorAll('a');

    for (const link of links) {
      const href = link.getAttribute('href') ?? '';
      expect(href).not.toMatch(/^javascript:/i);
      expect(href).not.toMatch(/^\/\//);
    }

    const safeLink = screen.getByRole('link', { name: 'GitHub' });
    expect(safeLink).toHaveAttribute('href', 'https://github.com/Alke-14');
    expect(safeLink).toHaveAttribute('rel', 'noopener noreferrer');
  });
});
