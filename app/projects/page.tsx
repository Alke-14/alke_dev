import Link from 'next/link';
import { reader } from '@/lib/keystatic';
import { sanitizeHref } from '@/lib/sanitize';
import { RevealCard, RevealSection } from '@/components/motion/reveal';
import { ArrowUpRight, ArrowLeft } from 'lucide-react';

export default async function ProjectsPage() {
  const showAdminLinks = process.env.NODE_ENV !== 'production';
  const allProjects = await reader.collections.projects.all();

  return (
    <main className="max-w-3xl mx-auto px-4 sm:px-6 py-10 sm:py-14 space-y-8 sm:space-y-10">
      <RevealSection immediate className="space-y-2">
        <Link
          href="/"
          className="text-xs font-mono text-muted-foreground hover:text-primary inline-flex items-center gap-1 transition-colors"
        >
          <ArrowLeft className="w-3 h-3" /> home
        </Link>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-sm bg-primary" />
          <h1 className="text-xl font-semibold tracking-tight text-foreground">Projects & Systems</h1>
        </div>
        <p className="text-sm text-muted-foreground">
          Selected software, tooling, and document compilation pipelines.
        </p>
      </RevealSection>

      {allProjects.length > 0 ? (
        <div className="space-y-6">
          {allProjects.map((project) => {
            const safeGithubHref = sanitizeHref(project.entry.github);
            const safeLiveHref = sanitizeHref(project.entry.link);

            return (
              <RevealCard key={project.slug}>
                <article className="p-4 sm:p-5 rounded-lg border border-border/80 bg-card/40 hover:border-primary/40 hover:bg-card transition-all space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1 sm:gap-4">
                    <div className="flex flex-wrap items-baseline gap-2.5">
                      <Link
                        href={`/projects/${project.slug}`}
                        className="font-medium text-base text-foreground hover:text-primary transition-colors hover:underline underline-offset-4"
                      >
                        {project.entry.title}
                      </Link>
                      {project.entry.year && (
                        <span className="text-[11px] font-mono px-1.5 py-0.5 rounded border border-border bg-secondary/50 text-muted-foreground">
                          {project.entry.year}
                        </span>
                      )}
                      {project.slug === 'house-rules' && (
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded border border-destructive/30 bg-destructive/10 text-destructive font-medium">
                          HackUTD 2nd
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-3 text-xs font-mono shrink-0 pt-1 sm:pt-0">
                      {safeGithubHref && (
                        <Link
                          href={safeGithubHref}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-muted-foreground hover:text-primary inline-flex items-center gap-0.5 transition-colors"
                        >
                          code <ArrowUpRight className="w-3 h-3" />
                        </Link>
                      )}
                      {safeLiveHref && (
                        <Link
                          href={safeLiveHref}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-muted-foreground hover:text-primary inline-flex items-center gap-0.5 transition-colors"
                        >
                          live <ArrowUpRight className="w-3 h-3" />
                        </Link>
                      )}
                    </div>
                  </div>

                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {project.entry.description}
                  </p>

                  {project.entry.tech && project.entry.tech.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {project.entry.tech.map((tech) => (
                        <span
                          key={tech}
                          className="text-[11px] font-mono px-2 py-0.5 rounded border border-border/70 bg-secondary/40 text-muted-foreground"
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
        <RevealSection className="p-6 sm:p-8 border border-dashed border-border/70 rounded-md text-xs text-muted-foreground font-mono flex flex-wrap items-center justify-between gap-2">
          <span>No projects published yet.</span>
          {showAdminLinks && (
            <Link href="/keystatic" className="text-primary hover:underline">
              Add your first project in Keystatic →
            </Link>
          )}
        </RevealSection>
      )}
    </main>
  );
}
