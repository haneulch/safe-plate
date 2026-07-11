#!/usr/bin/env node
/**
 * Convert data/profile-stats.jsonl to CSV (stdout or data/profile-stats.csv).
 * Usage: node scripts/stats-to-csv.mjs [--out]
 */
import { readFileSync, writeFileSync } from 'fs';
import path from 'path';

const dir = process.env.STATS_DIR || path.join(process.cwd(), 'data');
const src = path.join(dir, 'profile-stats.jsonl');

let lines;
try {
  lines = readFileSync(src, 'utf8').trim().split('\n').filter(Boolean);
} catch {
  console.error(`no stats file at ${src}`);
  process.exit(1);
}

const rows = lines.map((l) => JSON.parse(l));
const header = ['ts', 'nation', 'langs', 'cond', 'alg', 'rel', 'hasEtc'];
const esc = (v) => {
  const s = Array.isArray(v) ? v.join('|') : String(v ?? '');
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};
const csv = [header.join(','), ...rows.map((r) => header.map((h) => esc(r[h])).join(','))].join('\n');

if (process.argv.includes('--out')) {
  const dst = path.join(dir, 'profile-stats.csv');
  writeFileSync(dst, csv + '\n');
  console.error(`wrote ${rows.length} rows → ${dst}`);
} else {
  console.log(csv);
}
