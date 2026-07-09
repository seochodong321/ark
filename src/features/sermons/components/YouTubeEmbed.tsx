import { youtubeEmbedUrl, youtubeWatchUrl } from "@/shared/utils/youtube";

/**
 * 유튜브 플레이어. 영상은 텍스트를 보완하는 역할이다.
 * 채널 설정으로 임베드가 차단될 수 있으므로 "유튜브에서 보기" 링크를 항상 제공한다.
 */
export function YouTubeEmbed({ videoId }: { videoId: string }) {
  return (
    <figure className="my-8">
      <div className="aspect-video w-full overflow-hidden rounded-xl border border-line bg-ink">
        <iframe
          src={youtubeEmbedUrl(videoId)}
          title="설교 영상"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="h-full w-full"
        />
      </div>
      <figcaption className="mt-2 text-right">
        <a
          href={youtubeWatchUrl(videoId)}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-ink-faint underline underline-offset-2 hover:text-accent"
        >
          영상이 재생되지 않나요? 유튜브에서 보기 ↗
        </a>
      </figcaption>
    </figure>
  );
}
