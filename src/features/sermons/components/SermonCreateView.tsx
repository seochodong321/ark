"use client";

import { useRouter } from "next/navigation";
import { AuthGate } from "@/features/auth/components/AuthGate";
import { ROUTES } from "@/shared/constants/routes";
import type { SermonInput, User } from "@/shared/types";
import {
  createSermonDraft,
  publishSermon,
} from "../repositories/sermonRepository";
import { SermonForm, type SermonFormAction } from "./SermonForm";

export function SermonCreateView() {
  const router = useRouter();

  const handleSave = async (
    user: User,
    input: SermonInput,
    action: SermonFormAction,
  ) => {
    const id = await createSermonDraft(user, input);
    if (action === "publish") {
      await publishSermon({
        id,
        authorId: user.uid,
        title: input.title,
        publishedAt: null,
      });
      router.push(ROUTES.sermonDetail(id));
    } else {
      router.push(ROUTES.archive);
    }
  };

  return (
    <AuthGate require="pastor">
      {(user) => (
        <SermonForm
          author={user}
          showFileImport
          onSave={(input, action) => handleSave(user, input, action)}
        />
      )}
    </AuthGate>
  );
}
