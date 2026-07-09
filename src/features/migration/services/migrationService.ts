import {
  fileExtension,
  isSupportedFile,
  parseSermonFile,
} from "@/features/sermons/services/documentParser";
import type { MigrationSummary, ParsedSermon } from "@/shared/types";

export interface MigrationFailure {
  fileName: string;
  reason: string;
}

interface ExpandResult {
  files: File[];
  failures: MigrationFailure[];
}

/** ZIP 파일을 풀어 지원 형식의 파일 목록으로 펼친다 */
export async function expandSelectedFiles(
  selected: File[],
): Promise<ExpandResult> {
  const files: File[] = [];
  const failures: MigrationFailure[] = [];

  for (const file of selected) {
    if (fileExtension(file.name) === "zip") {
      try {
        const { default: JSZip } = await import("jszip");
        const zip = await JSZip.loadAsync(await file.arrayBuffer());
        for (const entry of Object.values(zip.files)) {
          if (entry.dir) continue;
          const baseName = entry.name.split("/").pop() ?? entry.name;
          // macOS 메타데이터·숨김 파일 제외
          if (entry.name.includes("__MACOSX") || baseName.startsWith("."))
            continue;
          if (!isSupportedFile(baseName)) {
            failures.push({
              fileName: entry.name,
              reason: "지원하지 않는 형식",
            });
            continue;
          }
          const blob = await entry.async("blob");
          files.push(new File([blob], baseName));
        }
      } catch {
        failures.push({
          fileName: file.name,
          reason: "ZIP 파일을 열 수 없습니다",
        });
      }
    } else if (isSupportedFile(file.name)) {
      files.push(file);
    } else {
      failures.push({
        fileName: file.name,
        reason: "지원하지 않는 형식 (DOCX·MD·TXT·ZIP만 가능)",
      });
    }
  }

  return { files, failures };
}

interface ParseAllResult {
  parsed: ParsedSermon[];
  failures: MigrationFailure[];
}

/** 모든 파일을 분석해 Draft 초안을 만든다 */
export async function parseAllFiles(
  files: File[],
  onProgress: (done: number, total: number) => void,
): Promise<ParseAllResult> {
  const parsed: ParsedSermon[] = [];
  const failures: MigrationFailure[] = [];
  let done = 0;

  for (const file of files) {
    try {
      parsed.push(await parseSermonFile(file));
    } catch (error) {
      failures.push({
        fileName: file.name,
        reason: error instanceof Error ? error.message : "분석 실패",
      });
    }
    done += 1;
    onProgress(done, files.length);
  }

  return { parsed, failures };
}

/** 게시된 설교 날짜들로 완료 화면 통계를 계산한다 */
export function computeMigrationSummary(
  sermonDates: Array<string | null>,
): MigrationSummary {
  const dates = sermonDates
    .filter((d): d is string => d !== null)
    .sort();
  return {
    totalCount: sermonDates.length,
    firstSermonDate: dates[0] ?? null,
    lastSermonDate: dates[dates.length - 1] ?? null,
  };
}
