import crypto from 'node:crypto';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const PROTECTED_PREFIXES = ['/keystatic', '/api/keystatic'];

function timingSafeMatch(input: string, expected: string): boolean {
  const inputHash = crypto.createHash('sha256').update(input).digest();
  const expectedHash = crypto.createHash('sha256').update(expected).digest();
  return crypto.timingSafeEqual(inputHash, expectedHash);
}

function unauthorizedResponse(): NextResponse {
  return new NextResponse('Authentication required.', {
    status: 401,
    headers: {
      'WWW-Authenticate': 'Basic realm="Alke CMS Admin", charset="UTF-8"',
      'Cache-Control': 'no-store',
      'X-Robots-Tag': 'noindex, nofollow',
    },
  });
}

function misconfiguredResponse(): NextResponse {
  return new NextResponse('Admin portal is not configured.', {
    status: 503,
    headers: {
      'Cache-Control': 'no-store',
      'X-Robots-Tag': 'noindex, nofollow',
    },
  });
}

function parseBasicCredentials(headerValue: string | null): { user: string; pass: string } | null {
  if (!headerValue) return null;

  const match = headerValue.match(/^basic\s+(.+)$/i);
  if (!match) return null;

  const token = match[1].trim();
  if (!token || !/^[A-Za-z0-9+/]+={0,2}$/.test(token)) {
    return null;
  }

  let decoded: string;
  try {
    decoded = Buffer.from(token, 'base64').toString('utf8');
  } catch {
    return null;
  }

  const separatorIndex = decoded.indexOf(':');
  if (separatorIndex === -1) return null;

  return {
    user: decoded.slice(0, separatorIndex),
    pass: decoded.slice(separatorIndex + 1),
  };
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isProtectedPath = PROTECTED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );

  if (!isProtectedPath || process.env.NODE_ENV !== 'production') {
    return NextResponse.next();
  }

  const expectedUser = process.env.KEYSTATIC_ADMIN_USER?.trim() ?? '';
  const expectedPassword = process.env.KEYSTATIC_ADMIN_PASSWORD ?? '';

  if (!expectedUser || expectedPassword.trim().length === 0) {
    return misconfiguredResponse();
  }

  const credentials = parseBasicCredentials(request.headers.get('authorization'));
  if (!credentials) {
    return unauthorizedResponse();
  }

  const userMatches = timingSafeMatch(credentials.user, expectedUser);
  const passwordMatches = timingSafeMatch(credentials.pass, expectedPassword);

  if (!userMatches || !passwordMatches) {
    return unauthorizedResponse();
  }

  const response = NextResponse.next();
  response.headers.set('Cache-Control', 'no-store');
  response.headers.set('X-Robots-Tag', 'noindex, nofollow');
  return response;
}

export const config = {
  matcher: ['/keystatic/:path*', '/api/keystatic/:path*'],
};
