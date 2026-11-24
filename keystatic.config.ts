import { config, fields, collection, singleton } from '@keystatic/core';

const repoOwner =
  process.env.NEXT_PUBLIC_KEYSTATIC_GITHUB_REPO_OWNER?.trim() || 'Alke-14';
const repoName =
  process.env.NEXT_PUBLIC_KEYSTATIC_GITHUB_REPO_NAME?.trim() || 'alke_dev';

export default config({
  // Never fall back to unauthenticated local storage in production
  storage:
    process.env.NODE_ENV === 'production'
      ? {
          kind: 'github',
          repo: `${repoOwner}/${repoName}`,
        }
      : {
          kind: 'local',
        },
  collections: {
    projects: collection({
      label: 'Projects',
      slugField: 'title',
      path: 'content/projects/*',
      format: { contentField: 'content' },
      schema: {
        title: fields.slug({ name: { label: 'Title' } }),
        description: fields.text({ label: 'Summary', multiline: true }),
        year: fields.text({ label: 'Year / Period', defaultValue: new Date().getFullYear().toString() }),
        link: fields.url({ label: 'Live Link (optional)' }),
        github: fields.url({ label: 'GitHub Repository (optional)' }),
        featured: fields.checkbox({ label: 'Feature on Home', defaultValue: true }),
        tech: fields.array(fields.text({ label: 'Technology / Tool' }), {
          label: 'Key Tech Stack',
          itemLabel: (props) => props.value,
        }),
        content: fields.markdoc({
          label: 'Case Study / Details',
        }),
      },
    }),
    posts: collection({
      label: 'Writing & Hobbies',
      slugField: 'title',
      path: 'content/posts/*',
      format: { contentField: 'content' },
      schema: {
        title: fields.slug({ name: { label: 'Title' } }),
        publishedDate: fields.date({
          label: 'Published Date',
          defaultValue: { kind: 'today' },
        }),
        category: fields.select({
          label: 'Category',
          options: [
            { label: 'Engineering & Code', value: 'engineering' },
            { label: 'Hobbies & Creative', value: 'hobbies' },
            { label: 'Notes & Reflections', value: 'notes' },
          ],
          defaultValue: 'engineering',
        }),
        summary: fields.text({ label: 'Short Excerpt', multiline: true }),
        content: fields.markdoc({
          label: 'Post Content',
        }),
      },
    }),
    updates: collection({
      label: 'Life Updates',
      slugField: 'title',
      path: 'content/updates/*',
      schema: {
        title: fields.slug({ name: { label: 'Short Title' } }),
        date: fields.date({
          label: 'Date',
          defaultValue: { kind: 'today' },
        }),
        category: fields.select({
          label: 'Type',
          options: [
            { label: 'Work & Projects', value: 'work' },
            { label: 'Personal & Hobbies', value: 'personal' },
            { label: 'Milestone', value: 'milestone' },
          ],
          defaultValue: 'work',
        }),
        detail: fields.text({ label: 'What happened?', multiline: true }),
        link: fields.url({ label: 'Related Link (optional)' }),
      },
    }),
  },
  singletons: {
    profile: singleton({
      label: 'Profile & Background',
      path: 'content/profile',
      schema: {
        name: fields.text({ label: 'Full Name', defaultValue: 'Alke' }),
        role: fields.text({ label: 'Headline / Role', defaultValue: 'Software Engineer & Builder' }),
        githubUsername: fields.text({ label: 'GitHub Username (for activity showcase)', defaultValue: '' }),
        intro: fields.text({
          label: 'Brief Intro Paragraph',
          multiline: true,
          defaultValue: 'Building software, exploring systems, and tinkering with ideas.',
        }),
        skills: fields.array(
          fields.object({
            group: fields.text({ label: 'Group (e.g. Languages, Core Stack, Tools)' }),
            items: fields.array(fields.text({ label: 'Skill' }), {
              label: 'Items',
              itemLabel: (p) => p.value,
            }),
          }),
          {
            label: 'Skill Groups',
            itemLabel: (p) => p.fields.group.value || 'Skill Group',
          }
        ),
      },
    }),
  },
});
