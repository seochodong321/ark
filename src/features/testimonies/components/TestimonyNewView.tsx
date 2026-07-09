"use client";

import { AuthGate } from "@/features/auth/components/AuthGate";
import { TestimonyEditor } from "./TestimonyEditor";

export function TestimonyNewView() {
  return <AuthGate>{(user) => <TestimonyEditor author={user} />}</AuthGate>;
}
