import 'server-only';

/**
 * 식품안전나라 (foodsafetykorea.go.kr) OpenAPI client.
 * URL shape: /api/{key}/{service}/json/{startIdx}/{endIdx}/{PARAM=value}
 * Services: C005 바코드연계제품정보, C002 식품(첨가물)품목제조보고(원재료).
 */

const BASE = 'https://openapi.foodsafetykorea.go.kr/api';

export class MfdsError extends Error {}

export function isMfdsEnabled(): boolean {
  return !!process.env.MFDS_API_KEY;
}

interface MfdsBody<T> {
  [service: string]: {
    total_count?: string;
    row?: T[];
    RESULT?: { MSG?: string; CODE?: string };
  };
}

async function call<T>(service: string, param: string, revalidate: number): Promise<T[]> {
  const key = process.env.MFDS_API_KEY;
  if (!key) throw new MfdsError('MFDS_API_KEY not configured');
  const url = `${BASE}/${key}/${service}/json/1/5/${param}`;
  const res = await fetch(url, { next: { revalidate } });
  if (!res.ok) throw new MfdsError(`MFDS HTTP ${res.status}`);
  let body: MfdsBody<T>;
  try {
    body = JSON.parse(await res.text());
  } catch {
    throw new MfdsError('MFDS non-JSON response');
  }
  const svc = body[service];
  const code = svc?.RESULT?.CODE;
  // INFO-000 success, INFO-200 no data
  if (code === 'INFO-200') return [];
  if (code && code !== 'INFO-000') throw new MfdsError(`MFDS ${code}: ${svc?.RESULT?.MSG}`);
  return svc?.row ?? [];
}

export interface C005Row {
  PRDLST_REPORT_NO: string; // 품목보고번호
  PRDLST_NM: string; // 제품명
  BSSH_NM?: string; // 제조사
  PRDLST_DCNM?: string; // 식품유형
  POG_DAYCNT?: string; // 소비기한
  BAR_CD: string;
}

export interface C002Row {
  PRDLST_REPORT_NO: string;
  PRDLST_NM: string;
  RAWMTRL_NM?: string; // 원재료 목록
  BSSH_NM?: string;
  PRDLST_DCNM?: string;
}

export async function productByBarcode(barcode: string): Promise<C005Row | undefined> {
  const rows = await call<C005Row>('C005', `BAR_CD=${encodeURIComponent(barcode)}`, 86400);
  return rows[0];
}

export async function ingredientsByReportNo(reportNo: string): Promise<C002Row | undefined> {
  const rows = await call<C002Row>(
    'C002',
    `PRDLST_REPORT_NO=${encodeURIComponent(reportNo)}`,
    86400,
  );
  return rows[0];
}
