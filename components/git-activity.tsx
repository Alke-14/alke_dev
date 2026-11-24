import Link from 'next/link';
import { GitBranch, GitCommit, ExternalLink } from 'lucide-react';

interface GitActivityProps {
  username?: string;
}

interface GitHubEvent {
  id: string;
  type: string;
  repo: { name: string };
  created_at: string;
  payload?: {
    commits?: Array<{ message: string; sha: string }>;
    action?: string;
  };
}

const GITHUB_USERNAME_REGEX = /^[a-zA-Z0-9-]{1,39}$/;

function parseValidGitHubUsername(username?: string): string | null {
  if (!username) return null;
  const trimmed = username.trim();
  return GITHUB_USERNAME_REGEX.test(trimmed) ? trimmed : null;
}

async function getRecentGitHubEvents(username: string): Promise<GitHubEvent[]> {
  if (!GITHUB_USERNAME_REGEX.test(username)) return [];
  try {
    const res = await fetch(`https://api.github.com/users/${username}/events/public?per_page=6`, {
      next: { revalidate: 3600 }, // Cache for 1 hour
      signal: AbortSignal.timeout(4000),
      headers: {
        'User-Agent': 'alke-portfolio',
        Accept: 'application/vnd.github.v3+json',
      },
    });

    if (!res.ok) return [];
    const data = await res.json();
    if (!Array.isArray(data)) return [];

    return data
      .filter((event: GitHubEvent) => event.type === 'PushEvent' || event.type === 'CreateEvent' || event.type === 'WatchEvent')
      .slice(0, 4);
  } catch {
    return [];
  }
}

export async function GitActivity({ username }: GitActivityProps) {
  const validUsername = parseValidGitHubUsername(username);
  const events = validUsername ? await getRecentGitHubEvents(validUsername) : [];

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground font-mono">
        <span className="flex items-center gap-1.5 text-foreground/90 font-medium">
          <GitBranch className="w-3.5 h-3.5 text-primary shrink-0" />
          Telemetry // GitHub Stream
        </span>
        {validUsername && (
          <Link
            href={`https://github.com/${validUsername}`}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-primary transition-colors inline-flex items-center gap-1 text-[11px]"
          >
            github.com/{validUsername}
            <ExternalLink className="w-3 h-3 shrink-0" />
          </Link>
        )}
      </div>

      {events.length > 0 ? (
        <div className="border border-border/80 rounded-lg divide-y divide-border/60 text-sm bg-card/40">
          {events.map((event) => {
            const commitMessage = event.payload?.commits?.[0]?.message?.split('\n')[0];
            const repoSimple = event.repo.name.split('/').pop() || event.repo.name;
            const date = new Date(event.created_at).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
            });

            return (
              <div key={event.id} className="p-3.5 flex items-start justify-between gap-3">
                <div className="min-w-0 flex items-start gap-2.5">
                  <GitCommit className="w-4 h-4 text-primary/80 mt-0.5 shrink-0" />
                  <div className="min-w-0">
                    <p className="truncate text-foreground font-mono text-xs">
                      {commitMessage || `${event.type.replace('Event', '')} on ${repoSimple}`}
                    </p>
                    <p className="text-[11px] font-mono text-muted-foreground truncate">{event.repo.name}</p>
                  </div>
                </div>
                <time className="text-[10px] font-mono text-muted-foreground shrink-0 px-1.5 py-0.5 rounded border border-border/60 bg-secondary/40">{date}</time>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="p-4 border border-dashed border-border/70 rounded-md text-xs text-muted-foreground font-mono flex flex-wrap items-center justify-between gap-2">
          <span>Git activity will sync from your public GitHub profile.</span>
          {validUsername && (
            <Link
              href={`https://github.com/${validUsername}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              View GitHub →
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
