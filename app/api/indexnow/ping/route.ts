import { NextResponse } from 'next/server';
import { getSiteUrl } from '@/lib/siteUrl';

export const runtime = 'nodejs';

const BASE_HOST = new URL(getSiteUrl()).hostname;

type RateState = { count: number; resetAt: number };
const rateMap = new Map<string, RateState>();

function getClientIp(request: Request): string {
  const xf = request.headers.get('x-forwarded-for');
  if (xf) return xf.split(',')[0].trim();
  return request.headers.get('x-real-ip') || 'unknown';
}

function isAllowedUrl(rawUrl: string): { ok: boolean; reason?: string } {
  let u: URL;
  try {
    u = new URL(rawUrl);
  } catch {
    return { ok: false, reason: 'Invalid URL' };
  }

  if (u.protocol !== 'https:') {
    return { ok: false, reason: 'URL must be https' };
  }

  if (u.hostname !== BASE_HOST) {
    return { ok: false, reason: `URL host must be ${BASE_HOST}` };
  }

  if (!u.pathname.startsWith('/guides/')) {
    return { ok: false, reason: 'Only /guides/* URLs are allowed' };
  }

  return { ok: true };
}

function checkRateLimit(key: string): { allowed: boolean; retryAfterSeconds?: number } {
  const now = Date.now();
  const windowMs = 60_000; // 1 minute
  const limit = 5;

  const state = rateMap.get(key);
  if (!state || state.resetAt <= now) {
    rateMap.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true };
  }

  if (state.count >= limit) {
    return { allowed: false, retryAfterSeconds: Math.max(1, Math.ceil((state.resetAt - now) / 1000)) };
  }

  state.count += 1;
  return { allowed: true };
}

function isAuthorized(request: Request): boolean {
  const secret = process.env.INDEXNOW_PING_SECRET;
  if (!secret) return false;

  const headerSecret = request.headers.get('x-indexnow-secret');
  if (headerSecret && headerSecret === secret) return true;

  const auth = request.headers.get('authorization');
  if (auth && auth.startsWith('Bearer ')) {
    const token = auth.slice('Bearer '.length).trim();
    if (token === secret) return true;
  }

  return false;
}

export async function POST(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const ip = getClientIp(request);
  const rl = checkRateLimit(ip);
  if (!rl.allowed) {
    return NextResponse.json(
      { error: 'Rate limited' },
      {
        status: 429,
        headers: {
          'Retry-After': String(rl.retryAfterSeconds || 60),
        },
      }
    );
  }

  const indexNowKey = process.env.INDEXNOW_KEY;
  if (!indexNowKey) {
    return NextResponse.json(
      { error: 'Missing INDEXNOW_KEY env var' },
      { status: 500 }
    );
  }

  const body = await request.json().catch(() => null);
  const rawUrl = typeof body?.url === 'string' ? body.url.trim() : '';

  if (!rawUrl) {
    return NextResponse.json({ error: 'Missing url' }, { status: 400 });
  }

  const allowed = isAllowedUrl(rawUrl);
  if (!allowed.ok) {
    return NextResponse.json({ error: allowed.reason || 'Invalid url' }, { status: 400 });
  }

  const payload = {
    host: BASE_HOST,
    key: indexNowKey,
    urlList: [rawUrl],
  };

  try {
    const res = await fetch('https://api.indexnow.org/indexnow', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const text = await res.text().catch(() => '');

    if (!res.ok) {
      return NextResponse.json(
        {
          error: 'IndexNow request failed',
          status: res.status,
          response: text || null,
        },
        { status: 502 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: 'IndexNow request failed', message }, { status: 502 });
  }
}
