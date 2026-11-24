import axe from 'axe-core';
import { expect } from 'vitest';

export async function expectNoA11yViolations(container: HTMLElement) {
  const results = await axe.run(container, {
    runOnly: {
      type: 'tag',
      values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'],
    },
    rules: {
      // jsdom does not evaluate Tailwind CSS custom properties or computed styles
      'color-contrast': { enabled: false },
    },
  });

  const formatted = results.violations.map((v) => ({
    id: v.id,
    impact: v.impact,
    description: v.description,
    nodes: v.nodes.map((n) => n.html),
  }));

  expect(formatted, `Accessibility violations found:\n${JSON.stringify(formatted, null, 2)}`).toEqual([]);
}
