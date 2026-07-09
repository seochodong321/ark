/** millis → "2026년 7월 9일" */
export function formatDate(millis: number | null): string {
  if (millis === null) return "";
  const d = new Date(millis);
  return `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일`;
}

/** millis → "2026.07.09" */
export function formatDateShort(millis: number | null): string {
  if (millis === null) return "";
  const d = new Date(millis);
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}.${mm}.${dd}`;
}

/** "YYYY-MM-DD" → "2026년 7월 9일" */
export function formatSermonDate(sermonDate: string | null): string {
  if (!sermonDate) return "";
  const [y, m, d] = sermonDate.split("-").map(Number);
  if (!y || !m || !d) return sermonDate;
  return `${y}년 ${m}월 ${d}일`;
}

/** 오늘 날짜를 "YYYY-MM-DD"로 반환 */
export function todayString(): string {
  const d = new Date();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${mm}-${dd}`;
}

/**
 * 첫 설교일과 마지막 설교일로 사역 기간을 계산한다.
 * 1년 미만이면 개월 수로 표기한다.
 */
export function formatMinistrySpan(
  first: string | null,
  last: string | null,
): string {
  if (!first || !last) return "";
  const start = new Date(first);
  const end = new Date(last);
  const months =
    (end.getFullYear() - start.getFullYear()) * 12 +
    (end.getMonth() - start.getMonth());
  if (months < 1) return "1개월 미만";
  if (months < 12) return `${months}개월`;
  const years = Math.floor(months / 12);
  const rest = months % 12;
  return rest > 0 ? `${years}년 ${rest}개월` : `${years}년`;
}

const DATE_ONLY = /^\d{4}-\d{2}-\d{2}$/;

export function isValidDateString(value: string): boolean {
  if (!DATE_ONLY.test(value)) return false;
  return !Number.isNaN(new Date(value).getTime());
}
