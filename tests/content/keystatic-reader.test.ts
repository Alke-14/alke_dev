import { describe, expect, it } from 'vitest';
import { reader } from '@/lib/keystatic';

describe('Keystatic content integrity', () => {
  it('reads profile singleton with valid GitHub username', async () => {
    const profile = await reader.singletons.profile.read();
    expect(profile).not.toBeNull();
    expect(profile?.name).toBeTruthy();
    if (profile?.githubUsername) {
      expect(profile.githubUsername).toMatch(/^[a-zA-Z0-9-]{1,39}$/);
    }
  });

  it('reads all project, post, and update entries cleanly', async () => {
    const [projects, posts, updates] = await Promise.all([
      reader.collections.projects.all(),
      reader.collections.posts.all(),
      reader.collections.updates.all(),
    ]);

    expect(projects.length).toBeGreaterThan(0);
    expect(posts.length).toBeGreaterThan(0);
    expect(updates.length).toBeGreaterThan(0);

    for (const project of projects) {
      expect(project.entry.title).toBeTruthy();
      const doc = await project.entry.content();
      expect(doc.node).toBeDefined();
    }

    for (const post of posts) {
      expect(post.entry.title).toBeTruthy();
      const doc = await post.entry.content();
      expect(doc.node).toBeDefined();
    }
  });
});
