import { describe, expect, it } from 'vitest';
import nextConfig from '@/next.config';

describe('Next.js serverless output tracing for Keystatic content', () => {
  it('includes content/**/* in outputFileTracingIncludes for ISR/server routes on Vercel', () => {
    expect(nextConfig.outputFileTracingIncludes).toBeDefined();

    const patterns = Object.values(nextConfig.outputFileTracingIncludes ?? {}).flat();
    expect(patterns).toContain('./content/**/*');
  });
});
