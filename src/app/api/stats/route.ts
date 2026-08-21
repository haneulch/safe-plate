import { NextRequest, NextResponse } from 'next/server';
import { appendFile, mkdir } from 'fs/promises';
import path from 'path';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { sanitizeSnapshot } from '@/lib/stats/snapshot';

export const runtime = 'nodejs';

/**
 * Anonymous profile-selection statistics collector.
 * By design stores NO identifiers: no IP, no user id, no free text, no location.
 * Timestamp is truncated to the hour to avoid narrow time-correlation.
 *
 * Storage: Supabase(safeplate_stats) when SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY
 * are set; otherwise appends one JSONL line to data/profile-stats.jsonl (local/demo).
 */
const STATS_DIR = process.env.STATS_DIR || path.join(process.cwd(), 'data');
const STATS_FILE = 'profile-stats.jsonl';
const MAX_BODY = 2048;

const supabaseEnabled = () =>
  !!process.env.SUPABASE_URL && !!process.env.SUPABASE_SERVICE_ROLE_KEY;

let db: SupabaseClient | null = null;
const getDb = () => {
  if (!db) {
    db = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }
  return db;
};

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
  const ts = new Date().toISOString().slice(0, 13) + ':00:00Z'; // hour precision only

  try {
    if (supabaseEnabled()) {
      const { error } = await getDb().from('safeplate_stats').insert({
        ts,
        nation: snapshot.nation,
        langs: snapshot.langs,
        cond: snapshot.cond,
        alg: snapshot.alg,
        rel: snapshot.rel,
        has_etc: snapshot.hasEtc,
        v: snapshot.v,
      });
      if (error) throw new Error(error.message);
    } else {
      const record = { ts, ...snapshot };
      await mkdir(STATS_DIR, { recursive: true });
      await appendFile(path.join(STATS_DIR, STATS_FILE), JSON.stringify(record) + '\n', 'utf8');
    }
  } catch (e) {
    console.error('stats write failed:', e);
    return NextResponse.json({ error: 'write failed' }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
