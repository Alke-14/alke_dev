import { notFound } from 'next/navigation';
import Link from 'next/link';
import { reader } from '@/lib/keystatic';
import { sanitizeHref } from '@/lib/sanitize';
import { DocumentRenderer } from '@/components/document-renderer';
import { RevealSection } from '@/components/motion/reveal';
import { ArrowLeft, ArrowUpRight } from 'lucide-react';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const projects = await reader.collections.projects.all();
  return projects.map((project) => ({ slug: project.slug }));
}

export default async function ProjectDetailPage({ params }: Props) {
  const { slug } = await params;
  const project = await reader.collections.projects.read(slug);

  if (!project) {
    notFound();
  }

  const content = await project.content();
  const safeGithubHref = sanitizeHref(project.github);
  const safeLiveHref = sanitizeHref(project.link);

  return (
    <main className="max-w-2xl mx-auto px-4 sm:px-6 py-10 sm:py-14 space-y-8">
      <RevealSection immediate as="div">
        <Link
          href="/projects"
          className="text-xs font-mono text-muted-foreground hover:text-primary inline-flex items-center gap-1 transition-colors"
        >
          <ArrowLeft className="w-3 h-3" /> all projects
        </Link>
      </RevealSection>

      <RevealSection immediate as="header" delay={0.04} className="space-y-4 border-b border-border/80 pb-6">
        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 sm:gap-4">
          <div className="flex flex-wrap items-baseline gap-2.5">
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">
              {project.title}
            </h1>
            {project.year && (
              <span className="text-xs font-mono px-2 py-0.5 rounded border border-border bg-secondary/50 text-muted-foreground">
                {project.year}
              </span>
            )}
            {slug === 'house-rules' && (
              <span className="text-[11px] font-mono px-2 py-0.5 rounded border border-destructive/30 bg-destructive/10 text-destructive font-medium">
                HackUTD 2nd
              </span>
            )}
          </div>

          <div className="flex items-center gap-3 text-xs font-mono shrink-0">
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

        <p className="text-sm text-muted-foreground leading-relaxed">
          {project.description}
        </p>

        {project.tech && project.tech.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {project.tech.map((item) => (
              <span
                key={item}
                className="font-mono text-[11px] px-2 py-0.5 rounded border border-border/80 bg-secondary/40 text-muted-foreground"
              >
                {item}
              </span>
            ))}
          </div>
        )}
      </RevealSection>

      {/* Case Study Content with Bullet Points and Markdoc Formatting */}
      <RevealSection delay={0.08} className="pt-2">
        <DocumentRenderer node={content.node} />
      </RevealSection>
    </main>
  );
}
