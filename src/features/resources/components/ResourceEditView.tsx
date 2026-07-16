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
import { isAdmin, type ResourcePost } from "@/shared/types";
import {
  fetchResource,
  updateResource,
} from "../repositories/resourceRepository";
import { ResourceForm } from "./ResourceForm";

type ViewState =
  | { phase: "loading" }
  | { phase: "error" }
  | { phase: "notFound" }
  | { phase: "ready"; resource: ResourcePost };

export function ResourceEditView({ id }: { id: string }) {
  const router = useRouter();
  const [state, setState] = useState<ViewState>({ phase: "loading" });
  const [reloadToken, setReloadToken] = useState(0);

  useEffect(() => {
    let cancelled = false;
    fetchResource(id)
      .then((resource) => {
        if (cancelled) return;
        setState(
          resource ? { phase: "ready", resource } : { phase: "notFound" },
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
          return <EmptyState title="자료를 찾을 수 없습니다" />;
        }
        const { resource } = state;
        if (resource.authorId !== user.uid && !isAdmin(user.role)) {
          return <EmptyState title="본인의 자료만 수정할 수 있습니다" />;
        }
        return (
          <ResourceForm
            author={user}
            initial={resource}
            onSave={async (input) => {
              await updateResource(resource.id, input);
              router.push(ROUTES.resourceDetail(resource.id));
            }}
          />
        );
      }}
    </AuthGate>
  );
}
