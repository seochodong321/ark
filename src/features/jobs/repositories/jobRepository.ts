import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  increment,
  limit,
  orderBy,
  query,
  serverTimestamp,
  startAfter,
  updateDoc,
  where,
  type DocumentData,
  type QueryConstraint,
  type QueryDocumentSnapshot,
} from "firebase/firestore";
import { getDb } from "@/shared/firebase/client";
import { COLLECTIONS } from "@/shared/firebase/collections";
import {
  asNumber,
  asString,
  asStringOrNull,
  toMillis,
} from "@/shared/firebase/converters";
import {
  buildPage,
  DEFAULT_PAGE_SIZE,
  type Page,
  type PageCursor,
} from "@/shared/firebase/pagination";
import type { JobInput, JobPost, JobStatus, User } from "@/shared/types";

function mapJob(id: string, data: DocumentData): JobPost {
  return {
    id,
    authorId: asString(data.authorId),
    authorName: asString(data.authorName),
    authorUsername: asString(data.authorUsername),
    title: asString(data.title),
    churchName: asString(data.churchName),
    position: asString(data.position),
    region: asString(data.region),
    employmentType: asStringOrNull(data.employmentType),
    description: asString(data.description),
    contactEmail: asStringOrNull(data.contactEmail),
    contactPhone: asStringOrNull(data.contactPhone),
    deadline: asStringOrNull(data.deadline),
    status: asString(data.status, "open") as JobStatus,
    viewCount: asNumber(data.viewCount),
    createdAt: toMillis(data.createdAt),
    updatedAt: toMillis(data.updatedAt),
  };
}

function mapDoc(d: QueryDocumentSnapshot<DocumentData>): JobPost {
  return mapJob(d.id, d.data());
}

/** 채용 공고 등록 — 공고는 게시 즉시 공개된다 */
export async function createJob(author: User, input: JobInput): Promise<string> {
  const ref = await addDoc(collection(getDb(), COLLECTIONS.jobs), {
    authorId: author.uid,
    authorName: author.name,
    authorUsername: author.username,
    ...input,
    status: "open",
    viewCount: 0,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
}

export async function updateJob(jobId: string, input: JobInput): Promise<void> {
  await updateDoc(doc(getDb(), COLLECTIONS.jobs, jobId), {
    ...input,
    updatedAt: serverTimestamp(),
  });
}

export async function setJobStatus(
  jobId: string,
  status: JobStatus,
): Promise<void> {
  await updateDoc(doc(getDb(), COLLECTIONS.jobs, jobId), {
    status,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteJob(jobId: string): Promise<void> {
  await deleteDoc(doc(getDb(), COLLECTIONS.jobs, jobId));
}

export async function fetchJob(id: string): Promise<JobPost | null> {
  const snap = await getDoc(doc(getDb(), COLLECTIONS.jobs, id));
  return snap.exists() ? mapJob(snap.id, snap.data()) : null;
}

export async function incrementJobView(id: string): Promise<void> {
  await updateDoc(doc(getDb(), COLLECTIONS.jobs, id), {
    viewCount: increment(1),
  });
}

export type JobListScope = "open" | "all";

export async function fetchJobs(
  scope: JobListScope,
  cursor: PageCursor = null,
  pageSize = DEFAULT_PAGE_SIZE,
): Promise<Page<JobPost>> {
  const constraints: QueryConstraint[] = [];
  if (scope === "open") {
    constraints.push(where("status", "==", "open"));
  }
  constraints.push(
    orderBy("createdAt", "desc"),
    ...(cursor ? [startAfter(cursor)] : []),
    limit(pageSize + 1),
  );
  const snap = await getDocs(
    query(collection(getDb(), COLLECTIONS.jobs), ...constraints),
  );
  return buildPage(snap.docs, pageSize, mapDoc);
}
