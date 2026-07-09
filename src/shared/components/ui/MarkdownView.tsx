import ReactMarkdown from "react-markdown";
import remarkBreaks from "remark-breaks";
import remarkGfm from "remark-gfm";
import { cn } from "@/shared/utils/cn";

/**
 * 설교/간증 본문 렌더러.
 * raw HTML은 렌더링하지 않는다(react-markdown 기본 동작 — XSS 방지).
 */
export function MarkdownView({
  content,
  className,
}: {
  content: string;
  className?: string;
}) {
  return (
    <div className={cn("article-body", className)}>
      <ReactMarkdown remarkPlugins={[remarkGfm, remarkBreaks]}>
        {content}
      </ReactMarkdown>
    </div>
  );
}
