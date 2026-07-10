"use client";

import { useRouter } from "next/navigation";
import { AuthGate } from "@/features/auth/components/AuthGate";
import { ROUTES } from "@/shared/constants/routes";
import { createJob } from "../repositories/jobRepository";
import { JobForm } from "./JobForm";

export function JobCreateView() {
  const router = useRouter();
  return (
    <AuthGate require="pastor">
      {(user) => (
        <JobForm
          author={user}
          onSave={async (input) => {
            const id = await createJob(user, input);
            router.push(ROUTES.jobDetail(id));
          }}
        />
      )}
    </AuthGate>
  );
}
