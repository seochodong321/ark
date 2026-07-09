import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import { getDb } from "@/shared/firebase/client";
import { COLLECTIONS } from "@/shared/firebase/collections";
import {
  asString,
  asStringArray,
  toMillis,
} from "@/shared/firebase/converters";
import { CURATION_DOC_ID, type CurationSettings } from "@/shared/types";

/** 홈 화면 운영자 큐레이션 설정 (settings/curation) */
export async function fetchCuration(): Promise<CurationSettings | null> {
  const snap = await getDoc(
    doc(getDb(), COLLECTIONS.settings, CURATION_DOC_ID),
  );
  if (!snap.exists()) return null;
  const data = snap.data();
  return {
    sermonIds: asStringArray(data.sermonIds),
    headline: asString(data.headline),
    updatedAt: toMillis(data.updatedAt),
  };
}

export async function saveCuration(
  sermonIds: string[],
  headline: string,
): Promise<void> {
  await setDoc(doc(getDb(), COLLECTIONS.settings, CURATION_DOC_ID), {
    sermonIds,
    headline,
    updatedAt: serverTimestamp(),
  });
}
