import Link from 'next/link';
import { reader } from '@/lib/keystatic';
import { RevealCard, RevealSection } from '@/components/motion/reveal';
import { ArrowLeft } from 'lucide-react';

export default async function WritingPage() {
  const showAdminLinks = process.env.NODE_ENV !== 'production';
  const allPosts = await reader.collections.posts.all();

  const sortedPosts = allPosts.sort(
    (a, b) => new Date(b.entry.publishedDate || '').getTime() - new Date(a.entry.publishedDate || '').getTime()
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
          <span className="w-2 h-2 rounded-sm bg-purple-500" />
          <h1 className="text-xl font-semibold tracking-tight text-foreground">
            Writing & Hobbies
          </h1>
        </div>
        <p className="text-sm text-muted-foreground">
          Photography, systems, esports events, and personal dispatches.
        </p>
      </RevealSection>

      {sortedPosts.length > 0 ? (
        <div className="space-y-6">
          {sortedPosts.map((post) => {
            const isHobby = post.entry.category === 'hobbies';
            const categoryLabel = isHobby ? 'Hobby' : post.entry.category === 'notes' ? 'Note' : 'Tech';

            return (
              <RevealCard key={post.slug}>
                <article className="p-4 sm:p-5 rounded-lg border border-border/80 bg-card/40 hover:border-purple-500/30 transition-colors space-y-2.5">
                  <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1 sm:gap-4">
                    <div className="flex flex-wrap items-baseline gap-2.5">
                      <Link
                        href={`/writing/${post.slug}`}
                        className="font-medium text-base text-foreground hover:text-primary transition-colors hover:underline underline-offset-4"
                      >
                        {post.entry.title}
                      </Link>
                      <span
                        className={`text-[10px] font-mono px-2 py-0.5 rounded border font-medium ${
                          isHobby
                            ? 'border-purple-500/30 bg-purple-500/10 text-purple-600 dark:text-purple-300'
                            : 'border-primary/30 bg-primary/10 text-primary'
                        }`}
                      >
                        {categoryLabel}
                      </span>
                    </div>

                    {post.entry.publishedDate && (
                      <time className="text-xs font-mono text-muted-foreground shrink-0">
                        {new Date(post.entry.publishedDate).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </time>
                    )}
                  </div>

                  {post.entry.summary && (
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {post.entry.summary}
                    </p>
                  )}
                </article>
              </RevealCard>
            );
          })}
        </div>
      ) : (
        <RevealSection className="p-6 sm:p-8 border border-dashed border-border/70 rounded-md text-xs text-muted-foreground font-mono flex flex-wrap items-center justify-between gap-2">
          <span>No posts published yet.</span>
          {showAdminLinks && (
            <Link href="/keystatic" className="text-primary hover:underline">
              Write your first entry in Keystatic →
            </Link>
          )}
        </RevealSection>
      )}
    </main>
  );
}
