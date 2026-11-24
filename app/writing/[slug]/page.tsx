import { notFound } from 'next/navigation';
import Link from 'next/link';
import { reader } from '@/lib/keystatic';
import { DocumentRenderer } from '@/components/document-renderer';
import { RevealSection } from '@/components/motion/reveal';
import { ArrowLeft } from 'lucide-react';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const posts = await reader.collections.posts.all();
  return posts.map((post) => ({ slug: post.slug }));
}

export default async function PostDetailPage({ params }: Props) {
  const { slug } = await params;
  const post = await reader.collections.posts.read(slug);

  if (!post) {
    notFound();
  }

  const content = await post.content();
  const isHobby = post.category === 'hobbies';

  return (
    <main className="max-w-2xl mx-auto px-4 sm:px-6 py-10 sm:py-14 space-y-8">
      <RevealSection immediate as="div">
        <Link
          href="/writing"
          className="text-xs font-mono text-muted-foreground hover:text-primary inline-flex items-center gap-1 transition-colors"
        >
          <ArrowLeft className="w-3 h-3" /> all writing
        </Link>
      </RevealSection>

      <RevealSection immediate as="header" delay={0.04} className="space-y-4 border-b border-border/80 pb-6">
        <div className="flex flex-wrap items-baseline gap-2.5">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            {post.title}
          </h1>
          <span
            className={`text-[10px] font-mono px-2 py-0.5 rounded border font-medium ${
              isHobby
                ? 'border-purple-500/30 bg-purple-500/10 text-purple-600 dark:text-purple-300'
                : 'border-primary/30 bg-primary/10 text-primary'
            }`}
          >
            {isHobby ? 'Hobby' : 'Tech'}
          </span>
        </div>

        <div className="flex items-center gap-3 text-xs font-mono text-muted-foreground">
          {post.publishedDate && (
            <time>
              {new Date(post.publishedDate).toLocaleDateString('en-US', {
                month: 'long',
                day: 'numeric',
                year: 'numeric',
              })}
            </time>
          )}
        </div>

        {post.summary && (
          <p className="text-sm text-muted-foreground leading-relaxed italic pt-1 border-l-2 border-purple-500/50 pl-3">
            {post.summary}
          </p>
        )}
      </RevealSection>

      {/* Body Content with Bullet Points and Markdoc Formatting */}
      <RevealSection delay={0.08} className="pt-2">
        <DocumentRenderer node={content.node} />
      </RevealSection>
    </main>
  );
}
