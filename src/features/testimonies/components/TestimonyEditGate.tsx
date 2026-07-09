"use client";

import { useEffect, useState } from "react";
import { AuthGate } from "@/features/auth/components/AuthGate";
import {
  EmptyState,
  ErrorState,
  LoadingState,
} from "@/shared/components/ui/StateView";
import { isAdmin, type Testimony } from "@/shared/types";
import { fetchTestimony } from "../repositories/testimonyRepository";
import { TestimonyEditor } from "./TestimonyEditor";

type ViewState =
  | { phase: "loading" }
  | { phase: "error" }
  | { phase: "notFound" }
  | { phase: "ready"; testimony: Testimony };

/** 간증 수정 화면 — 소유자 확인 후 에디터를 연다 */
export function TestimonyEditGate({ id }: { id: string }) {
  const [state, setState] = useState<ViewState>({ phase: "loading" });
  const [reloadToken, setReloadToken] = useState(0);

  useEffect(() => {
    let cancelled = false;
    fetchTestimony(id)
      .then((testimony) => {
        if (cancelled) return;
        setState(
          testimony ? { phase: "ready", testimony } : { phase: "notFound" },
        );
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

  return (
    <AuthGate>
      {(user) => {
        if (state.phase === "loading") return <LoadingState />;
        if (state.phase === "error") return <ErrorState onRetry={load} />;
        if (state.phase === "notFound") {
          return <EmptyState title="간증을 찾을 수 없습니다" />;
        }
        const { testimony } = state;
        if (testimony.authorId !== user.uid && !isAdmin(user.role)) {
          return <EmptyState title="본인의 간증만 수정할 수 있습니다" />;
        }
        return <TestimonyEditor author={user} existing={testimony} />;
      }}
    </AuthGate>
  );
}
