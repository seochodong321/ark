"use client";

import { useRouter } from "next/navigation";
import { AuthGate } from "@/features/auth/components/AuthGate";
import { ROUTES } from "@/shared/constants/routes";
import { createResource } from "../repositories/resourceRepository";
import { ResourceForm } from "./ResourceForm";

export function ResourceCreateView() {
  const router = useRouter();
  return (
    <AuthGate>
      {(user) => (
        <ResourceForm
          author={user}
          onSave={async (input) => {
            const id = await createResource(user, input);
            router.push(ROUTES.resourceDetail(id));
          }}
        />
      )}
    </AuthGate>
  );
}
