import { describe, expect, it } from 'vitest';
import { sanitizeSnapshot, toSnapshot } from '../snapshot';
import { EMPTY_PROFILE } from '../../types';

describe('toSnapshot', () => {
  it('whitelists fields and never includes free text', () => {
    const snap = toSnapshot({
      ...EMPTY_PROFILE,
      nation: 'us',
      langs: ['en'],
      alg: ['peanut'],
      etc: '전화번호 010-1234-5678',
    });
    expect(snap).toEqual({
      v: 1, nation: 'us', langs: ['en'], cond: [], alg: ['peanut'], rel: [], hasEtc: true,
    });
    expect(JSON.stringify(snap)).not.toContain('010');
  });
});

describe('sanitizeSnapshot', () => {
  it('accepts a valid payload', () => {
    expect(
      sanitizeSnapshot({ v: 1, nation: 'jp', langs: ['ja'], cond: ['sugar'], alg: [], rel: ['halal'], hasEtc: false }),
    ).toBeTruthy();
  });
  it('rejects unknown ids, injected fields, wrong shapes', () => {
    expect(sanitizeSnapshot({ v: 1, nation: 'zz', langs: [], cond: [], alg: [], rel: [] })).toBeNull();
    expect(sanitizeSnapshot({ v: 1, nation: null, langs: ['en'], cond: ['<script>'], alg: [], rel: [] })).toBeNull();
    expect(sanitizeSnapshot('junk')).toBeNull();
    expect(sanitizeSnapshot({ v: 2 })).toBeNull();
  });
  it('drops extra fields (no free-text smuggling)', () => {
    const out = sanitizeSnapshot({ v: 1, nation: null, langs: [], cond: [], alg: [], rel: [], etc: 'secret', ip: 'x' });
    expect(out && 'etc' in out).toBe(false);
    expect(out && 'ip' in out).toBe(false);
  });
});
