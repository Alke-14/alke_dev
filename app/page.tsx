import Image from 'next/image';
import Link from 'next/link';
import { reader } from '@/lib/keystatic';
import { sanitizeHref } from '@/lib/sanitize';
import { GitActivity } from '@/components/git-activity';
import { RevealCard, RevealGroup, RevealItem, RevealSection } from '@/components/motion/reveal';
import { ArrowUpRight } from 'lucide-react';

export default async function HomePage() {
  const showAdminLinks = process.env.NODE_ENV !== 'production';
  const profile = await reader.singletons.profile.read();
  const allProjects = await reader.collections.projects.all();
  const allPosts = await reader.collections.posts.all();
  const allUpdates = await reader.collections.updates.all();

  const githubProfileHref =
    profile?.githubUsername && /^[a-zA-Z0-9-]{1,39}$/.test(profile.githubUsername.trim())
      ? `https://github.com/${profile.githubUsername.trim()}`
      : null;

  // Filter & sort
  const featuredProjects = allProjects
    .filter((p) => p.entry.featured)
    .slice(0, 3);

  const displayProjects = featuredProjects.length > 0 ? featuredProjects : allProjects.slice(0, 3);

  const sortedPosts = allPosts
    .sort((a, b) => new Date(b.entry.publishedDate || '').getTime() - new Date(a.entry.publishedDate || '').getTime())
    .slice(0, 3);

  const sortedUpdates = allUpdates
    .sort((a, b) => new Date(b.entry.date || '').getTime() - new Date(a.entry.date || '').getTime())
    .slice(0, 4);

  return (
    <main className="max-w-3xl mx-auto px-4 sm:px-6 py-10 sm:py-14 space-y-12 sm:space-y-16">
      {/* Intro Header */}
      <RevealSection immediate className="flex flex-col sm:flex-row sm:items-start gap-5 sm:gap-6">
        <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden shrink-0 border border-border ring-2 ring-primary/25 ring-offset-2 ring-offset-background bg-secondary/40">
          <Image
            src="/PFP.jpg"
            alt={profile?.name || 'Kevin A. Hernandez Garcia'}
            width={360}
            height={360}
            loading="eager"
            className="w-full h-full object-cover object-top"
          />
        </div>

        <div className="space-y-4 min-w-0">
          <div>
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="text-2xl font-semibold tracking-tight text-foreground">
                {profile?.name || 'Kevin A. Hernandez Garcia'}
              </h1>
              <span className="font-mono text-[10px] uppercase tracking-wider px-2 py-0.5 rounded border border-purple-500/30 bg-purple-500/10 text-purple-600 dark:text-purple-300 font-medium whitespace-nowrap">
                Alke-14 // RX-105
              </span>
            </div>
            <p className="text-sm font-mono text-muted-foreground mt-1">
              {profile?.role || 'Full Stack Developer & CS Student'}
            </p>
          </div>

          <p className="text-sm leading-relaxed text-muted-foreground max-w-xl">
            {profile?.intro ||
              'Computer Science student at Texas A&M University - San Antonio building accessible web applications, automated document pipelines, and AI-driven tools.'}
          </p>

          {(githubProfileHref || showAdminLinks) && (
            <div className="flex flex-wrap items-center gap-4 text-xs font-mono pt-1 text-muted-foreground">
              {githubProfileHref && (
                <Link
                  href={githubProfileHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-primary transition-colors inline-flex items-center gap-0.5"
                >
                  github <ArrowUpRight className="w-3 h-3" />
                </Link>
              )}
              {showAdminLinks && (
                <Link
                  href="/keystatic"
                  className="hover:text-primary transition-colors inline-flex items-center gap-0.5"
                >
                  cms admin <ArrowUpRight className="w-3 h-3" />
                </Link>
              )}
            </div>
          )}
        </div>
      </RevealSection>

      {/* Projects */}
      <RevealSection className="space-y-6">
        <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-border/80 pb-2">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-sm bg-primary" />
            <h2 className="text-sm font-mono uppercase tracking-wider text-foreground">
              Featured Projects
            </h2>
          </div>
          {allProjects.length > 0 && (
            <Link
              href="/projects"
              className="text-xs font-mono text-muted-foreground hover:text-primary transition-colors"
            >
              all projects ({allProjects.length}) →
            </Link>
          )}
        </div>

        {displayProjects.length > 0 ? (
          <div className="space-y-6">
            {displayProjects.map((project) => {
              const safeGithubHref = sanitizeHref(project.entry.github);
              const safeLiveHref = sanitizeHref(project.entry.link);

              return (
                <RevealCard key={project.slug}>
                  <article className="group p-4 rounded-lg border border-border/70 bg-card/50 hover:border-primary/40 hover:bg-card transition-all space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1 sm:gap-4">
                      <div className="flex flex-wrap items-baseline gap-2">
                        <Link
                          href={`/projects/${project.slug}`}
                          className="font-medium text-base text-foreground group-hover:text-primary transition-colors hover:underline underline-offset-4"
                        >
                          {project.entry.title}
                        </Link>
                        {project.entry.year && (
                          <span className="font-mono text-[11px] px-1.5 py-0.5 rounded border border-border bg-secondary/60 text-muted-foreground">
                            {project.entry.year}
                          </span>
                        )}
                        {project.slug === 'house-rules' && (
                          <span className="font-mono text-[10px] px-1.5 py-0.5 rounded border border-destructive/30 bg-destructive/10 text-destructive font-medium">
                            HackUTD 2nd
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-3 shrink-0 text-xs font-mono pt-1 sm:pt-0">
                        {safeGithubHref && (
                          <Link
                            href={safeGithubHref}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-muted-foreground hover:text-primary transition-colors inline-flex items-center gap-0.5"
                          >
                            code <ArrowUpRight className="w-3 h-3" />
                          </Link>
                        )}
                        {safeLiveHref && (
                          <Link
                            href={safeLiveHref}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-muted-foreground hover:text-primary transition-colors inline-flex items-center gap-0.5"
                          >
                            live <ArrowUpRight className="w-3 h-3" />
                          </Link>
                        )}
                      </div>
                    </div>

                    <p className="text-xs text-muted-foreground leading-relaxed max-w-xl">
                      {project.entry.description}
                    </p>

                    {project.entry.tech && project.entry.tech.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {project.entry.tech.map((tech) => (
                          <span
                            key={tech}
                            className="text-[10px] font-mono px-2 py-0.5 rounded border border-border/80 bg-secondary/40 text-muted-foreground group-hover:border-primary/30 transition-colors"
                          >
                            {tech}
                          </span>
                        ))}
                      </div>
                    )}
                  </article>
                </RevealCard>
              );
            })}
          </div>
        ) : (
          <div className="p-4 border border-dashed border-border/70 rounded-md text-xs text-muted-foreground font-mono flex flex-wrap items-center justify-between gap-2">
            <span>No projects published yet.</span>
            {showAdminLinks && (
              <Link href="/keystatic" className="text-primary hover:underline">
                Add in Keystatic →
              </Link>
            )}
          </div>
        )}
      </RevealSection>

      {/* Writing & Hobbies */}
      <RevealSection className="space-y-6">
        <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-border/80 pb-2">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-sm bg-purple-500" />
            <h2 className="text-sm font-mono uppercase tracking-wider text-foreground">
              Writing & Hobbies
            </h2>
          </div>
          {allPosts.length > 0 && (
            <Link
              href="/writing"
              className="text-xs font-mono text-muted-foreground hover:text-primary transition-colors"
            >
              all entries ({allPosts.length}) →
            </Link>
          )}
        </div>

        {sortedPosts.length > 0 ? (
          <div className="space-y-4">
            {sortedPosts.map((post) => {
              const isHobby = post.entry.category === 'hobbies';
              return (
                <RevealCard key={post.slug}>
                  <article className="p-4 rounded-lg border border-border/70 bg-card/40 hover:border-purple-500/30 transition-colors space-y-1.5">
                    <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1 sm:gap-4">
                      <div className="flex flex-wrap items-baseline gap-2">
                        <Link
                          href={`/writing/${post.slug}`}
                          className="font-medium text-sm text-foreground hover:text-primary transition-colors hover:underline underline-offset-4"
                        >
                          {post.entry.title}
                        </Link>
                        <span
                          className={`text-[10px] font-mono px-1.5 py-0.5 rounded border font-medium ${
                            isHobby
                              ? 'border-purple-500/30 bg-purple-500/10 text-purple-600 dark:text-purple-300'
                              : 'border-primary/30 bg-primary/10 text-primary'
                          }`}
                        >
                          {isHobby ? 'Hobby' : 'Tech'}
                        </span>
                      </div>

                      {post.entry.publishedDate && (
                        <time className="text-xs font-mono text-muted-foreground shrink-0">
                          {new Date(post.entry.publishedDate).toLocaleDateString('en-US', {
                            month: 'short',
                            year: 'numeric',
                          })}
                        </time>
                      )}
                    </div>
                    {post.entry.summary && (
                      <p className="text-xs text-muted-foreground leading-relaxed max-w-xl">
                        {post.entry.summary}
                      </p>
                    )}
                  </article>
                </RevealCard>
              );
            })}
          </div>
        ) : (
          <div className="p-4 border border-dashed border-border/70 rounded-md text-xs text-muted-foreground font-mono flex flex-wrap items-center justify-between gap-2">
            <span>No posts or hobby notes published yet.</span>
            {showAdminLinks && (
              <Link href="/keystatic" className="text-primary hover:underline">
                Write entry in Keystatic →
              </Link>
            )}
          </div>
        )}
      </RevealSection>

      {/* Life Updates / Log */}
      <RevealSection className="space-y-6">
        <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-border/80 pb-2">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-sm bg-amber-500" />
            <h2 className="text-sm font-mono uppercase tracking-wider text-foreground">
              Log & Milestones
            </h2>
          </div>
          {allUpdates.length > 0 && (
            <Link
              href="/updates"
              className="text-xs font-mono text-muted-foreground hover:text-primary transition-colors"
            >
              changelog ({allUpdates.length}) →
            </Link>
          )}
        </div>

        {sortedUpdates.length > 0 ? (
          <div className="space-y-3">
            {sortedUpdates.map((update) => {
              const isDeansList = update.slug.includes('deans-list');
              const isHackathon = update.slug.includes('hackutd');
              const isMilestone = update.entry.category === 'milestone';

              return (
                <RevealCard key={update.slug}>
                  <div className="p-3.5 rounded-lg border border-border/70 bg-card/30 flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-4 text-xs">
                    <div className="flex sm:flex-col items-center sm:items-start gap-2 sm:gap-1 shrink-0 sm:w-24">
                      <time className="font-mono text-muted-foreground block text-[11px]">
                        {update.entry.date}
                      </time>
                      <span
                        className={`inline-block text-[9px] font-mono uppercase tracking-wider px-1.5 py-0.2 rounded border font-medium ${
                          isDeansList
                            ? 'border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400'
                            : isHackathon || isMilestone
                            ? 'border-destructive/30 bg-destructive/10 text-destructive'
                            : 'border-primary/30 bg-primary/10 text-primary'
                        }`}
                      >
                        {isDeansList ? 'Honor' : update.entry.category}
                      </span>
                    </div>

                    <div className="space-y-0.5 min-w-0">
                      <p className="font-medium text-foreground text-xs">
                        {update.entry.title}
                      </p>
                      <p className="text-muted-foreground leading-relaxed text-xs">
                        {update.entry.detail}
                      </p>
                    </div>
                  </div>
                </RevealCard>
              );
            })}
          </div>
        ) : (
          <div className="p-4 border border-dashed border-border/70 rounded-md text-xs text-muted-foreground font-mono flex flex-wrap items-center justify-between gap-2">
            <span>No updates logged yet.</span>
            {showAdminLinks && (
              <Link href="/keystatic" className="text-primary hover:underline">
                Add update in Keystatic →
              </Link>
            )}
          </div>
        )}
      </RevealSection>

      {/* Skillset & Toolkit (pop-up card entrance) */}
      {profile?.skills && profile.skills.length > 0 && (
        <RevealSection className="space-y-6">
          <div className="flex items-center gap-2 border-b border-border/80 pb-2">
            <span className="w-1.5 h-1.5 rounded-sm bg-primary/80" />
            <h2 className="text-sm font-mono uppercase tracking-wider text-foreground">
              Capabilities & Toolkit
            </h2>
          </div>

          <RevealGroup stagger={0.08} className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 text-xs">
            {profile.skills.map((group) => (
              <RevealItem key={group.group} variant="pop">
                <div className="h-full p-4 rounded-lg border border-border/70 bg-card/30 space-y-2.5">
                  <h3 className="font-mono text-xs font-semibold text-foreground tracking-tight border-b border-border/50 pb-1.5">
                    {group.group}
                  </h3>
                  <div className="flex flex-wrap gap-1.5">
                    {group.items.map((item) => (
                      <span
                        key={item}
                        className="font-mono text-[11px] px-2 py-0.5 rounded border border-border/70 bg-secondary/50 text-foreground/90"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              </RevealItem>
            ))}
          </RevealGroup>
        </RevealSection>
      )}

      {/* Git Activity Stream */}
      <RevealSection className="space-y-4">
        <GitActivity username={profile?.githubUsername} />
      </RevealSection>

      {/* Understated Footer */}
      <RevealSection
        as="footer"
        className="pt-8 border-t border-border/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs font-mono text-muted-foreground"
      >
        <span>alke.dev · rx-105 xi edition</span>
        <span>managed with keystatic</span>
      </RevealSection>
    </main>
  );
}
