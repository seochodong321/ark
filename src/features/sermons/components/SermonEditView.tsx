"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AuthGate } from "@/features/auth/components/AuthGate";
import {
  EmptyState,
  ErrorState,
  LoadingState,
} from "@/shared/components/ui/StateView";
import { ROUTES } from "@/shared/constants/routes";
import { isAdmin, type Sermon, type SermonInput, type User } from "@/shared/types";
import {
  fetchSermon,
  publishSermon,
  updateSermon,
} from "../repositories/sermonRepository";
import { SermonForm, type SermonFormAction } from "./SermonForm";

type ViewState =
  | { phase: "loading" }
  | { phase: "error" }
  | { phase: "notFound" }
  | { phase: "ready"; sermon: Sermon };

export function SermonEditView({ id }: { id: string }) {
  const router = useRouter();
  const [state, setState] = useState<ViewState>({ phase: "loading" });
  const [reloadToken, setReloadToken] = useState(0);

  useEffect(() => {
    let cancelled = false;
    fetchSermon(id)
      .then((sermon) => {
        if (cancelled) return;
        setState(sermon ? { phase: "ready", sermon } : { phase: "notFound" });
      })
      .catch(() => {
        if (!cancelled) setState({ phase: "error" });
      });
    return () => {
      cancelled = true;
    };
  }, [id, reloadToken]);

  const load = () => {
    setState({ phase: "loading" });
    setReloadToken((t) => t + 1);
  };

  const handleSave = async (
    user: User,
    sermon: Sermon,
    input: SermonInput,
    action: SermonFormAction,
  ) => {
    await updateSermon(sermon.id, user, input);
    if (action === "publish" && sermon.status !== "published") {
      await publishSermon(sermon);
    }
    router.push(ROUTES.sermonDetail(sermon.id));
  };

  return (
    <AuthGate require="pastor">
      {(user) => {
        if (state.phase === "loading") return <LoadingState />;
        if (state.phase === "error") return <ErrorState onRetry={load} />;
        if (state.phase === "notFound") {
          return <EmptyState title="설교를 찾을 수 없습니다" />;
        }
        const { sermon } = state;
        if (sermon.authorId !== user.uid && !isAdmin(user.role)) {
          return <EmptyState title="본인의 설교만 수정할 수 있습니다" />;
        }
        return (
          <SermonForm
            author={user}
            initial={{
              title: sermon.title,
              sermonDate: sermon.sermonDate,
              scripture: sermon.scripture,
              body: sermon.body,
              tags: sermon.tags,
              series: sermon.series,
              coverImageUrl: sermon.coverImageUrl,
              youtubeVideoId: sermon.youtubeVideoId,
            }}
            publishedMode={sermon.status === "published"}
            onSave={(input, action) => handleSave(user, sermon, input, action)}
          />
        );
      }}
    </AuthGate>
  );
}
