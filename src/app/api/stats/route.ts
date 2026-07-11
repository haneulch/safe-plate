import { NextRequest, NextResponse } from 'next/server';
import { appendFile, mkdir } from 'fs/promises';
import path from 'path';
import { sanitizeSnapshot } from '@/lib/stats/snapshot';

export const runtime = 'nodejs';

/**
 * Anonymous profile-selection statistics collector.
 * Appends one JSONL line per onboarding completion to data/profile-stats.jsonl.
 * By design stores NO identifiers: no IP, no user id, no free text, no location.
 * Timestamp is truncated to the hour to avoid narrow time-correlation.
 */
const STATS_DIR = process.env.STATS_DIR || path.join(process.cwd(), 'data');
const STATS_FILE = 'profile-stats.jsonl';
const MAX_BODY = 2048;

export async function POST(req: NextRequest) {
  const raw = await req.text();
  if (raw.length > MAX_BODY) {
    return NextResponse.json({ error: 'payload too large' }, { status: 413 });
  }
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return NextResponse.json({ error: 'invalid json' }, { status: 400 });
  }
  const snapshot = sanitizeSnapshot(parsed);
  if (!snapshot) {
    return NextResponse.json({ error: 'invalid snapshot' }, { status: 400 });
  }
  const record = {
    ts: new Date().toISOString().slice(0, 13) + ':00:00Z', // hour precision only
    ...snapshot,
  };
  try {
    await mkdir(STATS_DIR, { recursive: true });
    await appendFile(path.join(STATS_DIR, STATS_FILE), JSON.stringify(record) + '\n', 'utf8');
  } catch (e) {
    console.error('stats write failed:', e);
    return NextResponse.json({ error: 'write failed' }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
