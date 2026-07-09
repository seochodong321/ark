/** Markdown 문법 기호를 제거한 순수 텍스트 */
export function stripMarkdown(markdown: string): string {
  return markdown
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`[^`]*`/g, " ")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, " ")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/[*_~>#|-]{1,}/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** 목록 카드용 본문 요약 */
export function excerpt(body: string, maxLength = 120): string {
  const plain = stripMarkdown(body);
  if (plain.length <= maxLength) return plain;
  return `${plain.slice(0, maxLength).trimEnd()}…`;
}

/** 쉼표 구분 문자열 → 정리된 태그 배열 */
export function parseTags(raw: string): string[] {
  return Array.from(
    new Set(
      raw
        .split(/[,，]/)
        .map((t) => t.trim().replace(/^#/, ""))
        .filter((t) => t.length > 0),
    ),
  ).slice(0, 10);
}
