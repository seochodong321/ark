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
import { isAdmin, type JobPost } from "@/shared/types";
import { fetchJob, updateJob } from "../repositories/jobRepository";
import { JobForm } from "./JobForm";

type ViewState =
  | { phase: "loading" }
  | { phase: "error" }
  | { phase: "notFound" }
  | { phase: "ready"; job: JobPost };

export function JobEditView({ id }: { id: string }) {
  const router = useRouter();
  const [state, setState] = useState<ViewState>({ phase: "loading" });
  const [reloadToken, setReloadToken] = useState(0);

  useEffect(() => {
    let cancelled = false;
    fetchJob(id)
      .then((job) => {
        if (cancelled) return;
        setState(job ? { phase: "ready", job } : { phase: "notFound" });
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
    <AuthGate require="pastor">
      {(user) => {
        if (state.phase === "loading") return <LoadingState />;
        if (state.phase === "error") return <ErrorState onRetry={load} />;
        if (state.phase === "notFound") {
          return <EmptyState title="공고를 찾을 수 없습니다" />;
        }
        const { job } = state;
        if (job.authorId !== user.uid && !isAdmin(user.role)) {
          return <EmptyState title="본인의 공고만 수정할 수 있습니다" />;
        }
        return (
          <JobForm
            author={user}
            initial={job}
            onSave={async (input) => {
              await updateJob(job.id, input);
              router.push(ROUTES.jobDetail(job.id));
            }}
          />
        );
      }}
    </AuthGate>
  );
}
