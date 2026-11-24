import Link from 'next/link';
import { reader } from '@/lib/keystatic';
import { sanitizeHref } from '@/lib/sanitize';
import { RevealCard, RevealSection } from '@/components/motion/reveal';
import { ArrowLeft, ArrowUpRight } from 'lucide-react';

export default async function UpdatesPage() {
  const showAdminLinks = process.env.NODE_ENV !== 'production';
  const allUpdates = await reader.collections.updates.all();

  const sortedUpdates = allUpdates.sort(
    (a, b) => new Date(b.entry.date || '').getTime() - new Date(a.entry.date || '').getTime()
  );

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
          <span className="w-2 h-2 rounded-sm bg-amber-500" />
          <h1 className="text-xl font-semibold tracking-tight text-foreground">
            Log & Milestones
          </h1>
        </div>
        <p className="text-sm text-muted-foreground">
          Changelog of engineering deployments, hackathon milestones, and student leadership.
        </p>
      </RevealSection>

      {sortedUpdates.length > 0 ? (
        <div className="relative border-l border-border pl-5 sm:pl-6 ml-1.5 sm:ml-2 space-y-8">
          {sortedUpdates.map((update) => {
            const isDeansList = update.slug.includes('deans-list');
            const isMilestone = update.entry.category === 'milestone';
            const safeLinkHref = sanitizeHref(update.entry.link);

            return (
              <RevealCard key={update.slug}>
                <div className="relative group space-y-2">
                  {/* Mecha node bullet */}
                  <div
                    className={`absolute -left-[25.5px] sm:-left-[29.5px] top-1.5 w-2.5 h-2.5 rounded-full border-2 border-background transition-colors ${
                      isDeansList
                        ? 'bg-amber-500 ring-2 ring-amber-500/20'
                        : isMilestone
                        ? 'bg-destructive ring-2 ring-destructive/20'
                        : 'bg-primary ring-2 ring-primary/20'
                    }`}
                  />

                  <div className="flex flex-wrap items-baseline gap-2.5 text-xs">
                    <time className="font-mono text-muted-foreground">
                      {update.entry.date}
                    </time>
                    <span
                      className={`text-[9px] font-mono uppercase tracking-wider px-2 py-0.5 rounded border font-medium ${
                        isDeansList
                          ? 'border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400'
                          : isMilestone
                          ? 'border-destructive/30 bg-destructive/10 text-destructive'
                          : 'border-primary/30 bg-primary/10 text-primary'
                      }`}
                    >
                      {isDeansList ? 'Honor' : update.entry.category}
                    </span>
                  </div>

                  <h2 className="text-sm font-medium text-foreground">
                    {update.entry.title}
                  </h2>

                  <p className="text-xs text-muted-foreground leading-relaxed max-w-xl">
                    {update.entry.detail}
                  </p>

                  {safeLinkHref && (
                    <Link
                      href={safeLinkHref}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-mono text-muted-foreground hover:text-primary inline-flex items-center gap-0.5 pt-1"
                    >
                      reference <ArrowUpRight className="w-3 h-3" />
                    </Link>
                  )}
                </div>
              </RevealCard>
            );
          })}
        </div>
      ) : (
        <RevealSection className="p-6 sm:p-8 border border-dashed border-border/70 rounded-md text-xs text-muted-foreground font-mono flex flex-wrap items-center justify-between gap-2">
          <span>No updates logged yet.</span>
          {showAdminLinks && (
            <Link href="/keystatic" className="text-primary hover:underline">
              Log your first update in Keystatic →
            </Link>
          )}
        </RevealSection>
      )}
    </main>
  );
}
