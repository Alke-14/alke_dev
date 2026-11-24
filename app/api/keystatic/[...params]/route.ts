import { makeRouteHandler } from '@keystatic/next/route-handler';
import config from '@/keystatic.config';

export const dynamic = 'force-dynamic';

let cachedHandler: ReturnType<typeof makeRouteHandler> | null = null;

function getHandler() {
  if (!cachedHandler) {
    cachedHandler = makeRouteHandler({ config });
  }
  return cachedHandler;
}

function hasProductionOAuthConfig(): boolean {
  return Boolean(
    process.env.KEYSTATIC_GITHUB_CLIENT_ID?.trim() &&
      process.env.KEYSTATIC_GITHUB_CLIENT_SECRET?.trim() &&
      process.env.KEYSTATIC_SECRET?.trim()
  );
}

function unconfiguredResponse(): Response {
  return new Response('Keystatic GitHub OAuth is not configured.', {
    status: 503,
    headers: {
      'Cache-Control': 'no-store',
    },
  });
}

export async function GET(req: Request) {
  if (process.env.NODE_ENV === 'production' && !hasProductionOAuthConfig()) {
    return unconfiguredResponse();
  }
  return getHandler().GET(req);
}

export async function POST(req: Request) {
  if (process.env.NODE_ENV === 'production' && !hasProductionOAuthConfig()) {
    return unconfiguredResponse();
  }
  return getHandler().POST(req);
}
