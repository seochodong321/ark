import {
  addDoc,
  collection,
  doc,
  documentId,
  getCountFromServer,
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
  writeBatch,
  type DocumentData,
  type QueryConstraint,
  type QueryDocumentSnapshot,
} from "firebase/firestore";
import { getDb } from "@/shared/firebase/client";
import { COLLECTIONS } from "@/shared/firebase/collections";
import {
  asNumber,
  asString,
  asStringArray,
  asStringOrNull,
  toMillis,
  toMillisOrNull,
} from "@/shared/firebase/converters";
import {
  buildPage,
  DEFAULT_PAGE_SIZE,
  type Page,
  type PageCursor,
} from "@/shared/firebase/pagination";
import { extractBibleBook } from "@/shared/constants/bibleBooks";
import { SEED_REWARD } from "@/shared/constants/seeds";
import { buildSearchKeywords } from "@/features/search/services/tokenizer";
import { chunk } from "@/shared/utils/array";
import type {
  ContentStatus,
  ParsedSermon,
  Sermon,
  SermonInput,
  User,
} from "@/shared/types";

export function mapSermon(id: string, data: DocumentData): Sermon {
  return {
    id,
    authorId: asString(data.authorId),
    authorName: asString(data.authorName),
    authorUsername: asString(data.authorUsername),
    title: asString(data.title),
    sermonDate: asStringOrNull(data.sermonDate),
    scripture: asStringOrNull(data.scripture),
    scriptureBook: asStringOrNull(data.scriptureBook),
    body: asString(data.body),
    tags: asStringArray(data.tags),
    series: asStringOrNull(data.series),
    coverImageUrl: asStringOrNull(data.coverImageUrl),
    youtubeVideoId: asStringOrNull(data.youtubeVideoId),
    status: asString(data.status, "draft") as ContentStatus,
    viewCount: asNumber(data.viewCount),
    seedCount: asNumber(data.seedCount),
    commentCount: asNumber(data.commentCount),
    searchKeywords: asStringArray(data.searchKeywords),
    createdAt: toMillis(data.createdAt),
    updatedAt: toMillis(data.updatedAt),
    publishedAt: toMillisOrNull(data.publishedAt),
  };
}

function sermonKeywords(input: SermonInput, author: User): string[] {
  return buildSearchKeywords({
    weighted: [
      input.title,
      input.scripture,
      input.series,
      input.tags.join(" "),
      author.name,
      author.username,
    ],
    body: input.body,
  });
}

/** SermonInput → Firestore 문서 필드 (신규 생성용) */
function draftDocData(author: User, input: SermonInput) {
  return {
    authorId: author.uid,
    authorName: author.name,
    authorUsername: author.username,
    title: input.title,
    sermonDate: input.sermonDate,
    scripture: input.scripture,
    scriptureBook: extractBibleBook(input.scripture),
    body: input.body,
    tags: input.tags,
    series: input.series,
    coverImageUrl: input.coverImageUrl,
    youtubeVideoId: input.youtubeVideoId,
    status: "draft" as const,
    viewCount: 0,
    seedCount: 0,
    commentCount: 0,
    searchKeywords: sermonKeywords(input, author),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    publishedAt: null,
  };
}

export function parsedToInput(parsed: ParsedSermon): SermonInput {
  return {
    title: parsed.title,
    sermonDate: parsed.sermonDate,
    scripture: parsed.scripture,
    body: parsed.body,
    tags: [],
    series: null,
    coverImageUrl: null,
    youtubeVideoId: null,
  };
}

export async function createSermonDraft(
  author: User,
  input: SermonInput,
): Promise<string> {
  const ref = await addDoc(
    collection(getDb(), COLLECTIONS.sermons),
    draftDocData(author, input),
  );
  return ref.id;
}

/** Migration Wizard: 여러 Draft를 batch로 생성한다 (batch당 최대 400개) */
export async function createSermonDrafts(
  author: User,
  inputs: SermonInput[],
): Promise<string[]> {
  const db = getDb();
  const ids: string[] = [];
  for (const group of chunk(inputs, 400)) {
    const batch = writeBatch(db);
    for (const input of group) {
      const ref = doc(collection(db, COLLECTIONS.sermons));
      batch.set(ref, draftDocData(author, input));
      ids.push(ref.id);
    }
    await batch.commit();
  }
  return ids;
}

export async function updateSermon(
  sermonId: string,
  author: User,
  input: SermonInput,
): Promise<void> {
  await updateDoc(doc(getDb(), COLLECTIONS.sermons, sermonId), {
    title: input.title,
    sermonDate: input.sermonDate,
    scripture: input.scripture,
    scriptureBook: extractBibleBook(input.scripture),
    body: input.body,
    tags: input.tags,
    series: input.series,
    coverImageUrl: input.coverImageUrl,
    youtubeVideoId: input.youtubeVideoId,
    searchKeywords: sermonKeywords(input, author),
    updatedAt: serverTimestamp(),
  });
}

/**
 * 게시: 상태 변경 + 최초 게시일 때만 씨앗 보상.
 * 재게시(숨김 해제 등)로 보상이 중복 지급되지 않도록 publishedAt으로 판별한다.
 */
export async function publishSermon(
  sermon: Pick<Sermon, "id" | "authorId" | "title" | "publishedAt">,
): Promise<void> {
  const db = getDb();
  const batch = writeBatch(db);
  const isFirstPublish = sermon.publishedAt === null;
  batch.update(doc(db, COLLECTIONS.sermons, sermon.id), {
    status: "published",
    publishedAt: isFirstPublish ? serverTimestamp() : sermon.publishedAt,
    updatedAt: serverTimestamp(),
  });
  if (isFirstPublish) {
    batch.update(doc(db, COLLECTIONS.users, sermon.authorId), {
      seedBalance: increment(SEED_REWARD.sermonPublish),
      updatedAt: serverTimestamp(),
    });
    batch.set(doc(collection(db, COLLECTIONS.seedTransactions)), {
      uid: sermon.authorId,
      amount: SEED_REWARD.sermonPublish,
      type: "sermonPublish",
      kind: "cheer",
      targetType: "sermon",
      targetId: sermon.id,
      memo: `설교 공개: ${sermon.title}`,
      createdAt: serverTimestamp(),
    });
  }
  await batch.commit();
}

/** Migration Wizard: Draft 일괄 게시 + 씨앗 일괄 보상 */
export async function publishSermonsBulk(
  authorId: string,
  sermons: Array<Pick<Sermon, "id" | "title">>,
): Promise<void> {
  const db = getDb();
  for (const group of chunk(sermons, 150)) {
    const batch = writeBatch(db);
    for (const sermon of group) {
      batch.update(doc(db, COLLECTIONS.sermons, sermon.id), {
        status: "published",
        publishedAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      batch.set(doc(collection(db, COLLECTIONS.seedTransactions)), {
        uid: authorId,
        amount: SEED_REWARD.sermonPublish,
        type: "sermonPublish",
        kind: "cheer",
        targetType: "sermon",
        targetId: sermon.id,
        memo: `설교 공개: ${sermon.title}`,
        createdAt: serverTimestamp(),
      });
    }
    batch.update(doc(db, COLLECTIONS.users, authorId), {
      seedBalance: increment(SEED_REWARD.sermonPublish * group.length),
      updatedAt: serverTimestamp(),
    });
    await batch.commit();
  }
}

export async function fetchSermon(id: string): Promise<Sermon | null> {
  const snap = await getDoc(doc(getDb(), COLLECTIONS.sermons, id));
  return snap.exists() ? mapSermon(snap.id, snap.data()) : null;
}

export async function incrementSermonView(id: string): Promise<void> {
  await updateDoc(doc(getDb(), COLLECTIONS.sermons, id), {
    viewCount: increment(1),
  });
}

/**
 * 설교 삭제. 공개 이력이 있으면(보상을 받았으면) 공개 보상을 회수한다.
 * 잔액이 부족해도 차감한다 — 음수 잔액을 허용해 보상 채굴을 막는다.
 */
export async function deleteSermon(
  sermon: Pick<Sermon, "id" | "authorId" | "title" | "publishedAt">,
): Promise<void> {
  const db = getDb();
  const batch = writeBatch(db);
  batch.delete(doc(db, COLLECTIONS.sermons, sermon.id));
  if (sermon.publishedAt !== null) {
    batch.update(doc(db, COLLECTIONS.users, sermon.authorId), {
      seedBalance: increment(-SEED_REWARD.sermonPublish),
      updatedAt: serverTimestamp(),
    });
    batch.set(doc(collection(db, COLLECTIONS.seedTransactions)), {
      uid: sermon.authorId,
      amount: -SEED_REWARD.sermonPublish,
      type: "contentDeleted",
      kind: "cheer",
      targetType: "sermon",
      targetId: sermon.id,
      memo: `설교 삭제 회수: ${sermon.title}`,
      createdAt: serverTimestamp(),
    });
  }
  await batch.commit();
}

export async function setSermonStatus(
  id: string,
  status: ContentStatus,
): Promise<void> {
  await updateDoc(doc(getDb(), COLLECTIONS.sermons, id), {
    status,
    updatedAt: serverTimestamp(),
  });
}

function mapDoc(d: QueryDocumentSnapshot<DocumentData>): Sermon {
  return mapSermon(d.id, d.data());
}

/** 공개 설교 목록 — 최신순 */
export async function fetchPublishedSermons(
  cursor: PageCursor = null,
  pageSize = DEFAULT_PAGE_SIZE,
): Promise<Page<Sermon>> {
  const constraints: QueryConstraint[] = [
    where("status", "==", "published"),
    orderBy("publishedAt", "desc"),
    ...(cursor ? [startAfter(cursor)] : []),
    limit(pageSize + 1),
  ];
  const snap = await getDocs(
    query(collection(getDb(), COLLECTIONS.sermons), ...constraints),
  );
  return buildPage(snap.docs, pageSize, mapDoc);
}

/** 많이 읽힌 설교 */
export async function fetchPopularSermons(count = 5): Promise<Sermon[]> {
  const snap = await getDocs(
    query(
      collection(getDb(), COLLECTIONS.sermons),
      where("status", "==", "published"),
      orderBy("viewCount", "desc"),
      limit(count),
    ),
  );
  return snap.docs.map(mapDoc);
}

/** 응원(씨앗)을 많이 받은 설교 — 홈 추천 분류용 */
export async function fetchMostCheeredSermons(count = 5): Promise<Sermon[]> {
  const snap = await getDocs(
    query(
      collection(getDb(), COLLECTIONS.sermons),
      where("status", "==", "published"),
      orderBy("seedCount", "desc"),
      limit(count),
    ),
  );
  return snap.docs.map(mapDoc).filter((s) => s.seedCount > 0);
}

export type SermonSort = "latest" | "oldest";

export interface AuthorSermonFilter {
  authorId: string;
  /** 미지정 시 published만. "all"은 본인/관리자 아카이브용 */
  scope?: "published" | "all";
  sort?: SermonSort;
  year?: number;
  scriptureBook?: string;
  tag?: string;
}

/** 목회자 페이지·개인 아카이브의 설교 탐색 쿼리 */
export async function fetchSermonsByAuthor(
  filter: AuthorSermonFilter,
  cursor: PageCursor = null,
  pageSize = DEFAULT_PAGE_SIZE,
): Promise<Page<Sermon>> {
  const constraints: QueryConstraint[] = [where("authorId", "==", filter.authorId)];

  if (filter.scope !== "all") {
    constraints.push(where("status", "==", "published"));
  }
  if (filter.year) {
    constraints.push(
      where("sermonDate", ">=", `${filter.year}-01-01`),
      where("sermonDate", "<=", `${filter.year}-12-31`),
    );
  }
  if (filter.scriptureBook) {
    constraints.push(where("scriptureBook", "==", filter.scriptureBook));
  }
  if (filter.tag) {
    constraints.push(where("tags", "array-contains", filter.tag));
  }

  if (filter.scope === "all") {
    constraints.push(orderBy("updatedAt", "desc"));
  } else {
    constraints.push(orderBy("sermonDate", filter.sort === "oldest" ? "asc" : "desc"));
  }

  constraints.push(...(cursor ? [startAfter(cursor)] : []), limit(pageSize + 1));
  const snap = await getDocs(
    query(collection(getDb(), COLLECTIONS.sermons), ...constraints),
  );
  return buildPage(snap.docs, pageSize, mapDoc);
}

/**
 * 작성자의 공개 설교 통계 (설교 수·첫/마지막 설교일) — 목회자 페이지 헤더용.
 * 전체 문서를 읽지 않도록 집계 쿼리 + limit(1) 쿼리만 사용한다.
 */
export async function fetchAuthorSermonStats(authorId: string): Promise<{
  count: number;
  firstDate: string | null;
  lastDate: string | null;
}> {
  const base = [
    where("authorId", "==", authorId),
    where("status", "==", "published"),
  ];
  const col = collection(getDb(), COLLECTIONS.sermons);
  const [countSnap, firstSnap, lastSnap] = await Promise.all([
    getCountFromServer(query(col, ...base)),
    getDocs(query(col, ...base, orderBy("sermonDate", "asc"), limit(1))),
    getDocs(query(col, ...base, orderBy("sermonDate", "desc"), limit(1))),
  ]);
  const dateOf = (docs: Array<QueryDocumentSnapshot<DocumentData>>) =>
    docs.length > 0 ? asStringOrNull(docs[0].data().sermonDate) : null;
  return {
    count: countSnap.data().count,
    firstDate: dateOf(firstSnap.docs),
    lastDate: dateOf(lastSnap.docs),
  };
}

/** 관리자 콘텐츠 관리 — 상태 무관 전체 설교 최신 수정순 */
export async function fetchAllSermonsForAdmin(
  cursor: PageCursor = null,
  pageSize = DEFAULT_PAGE_SIZE,
): Promise<Page<Sermon>> {
  const constraints: QueryConstraint[] = [
    orderBy("updatedAt", "desc"),
    ...(cursor ? [startAfter(cursor)] : []),
    limit(pageSize + 1),
  ];
  const snap = await getDocs(
    query(collection(getDb(), COLLECTIONS.sermons), ...constraints),
  );
  return buildPage(snap.docs, pageSize, mapDoc);
}

/** 큐레이션 등 ID 목록으로 조회 (입력 순서 유지) */
export async function fetchSermonsByIds(ids: string[]): Promise<Sermon[]> {
  if (ids.length === 0) return [];
  const db = getDb();
  const results = new Map<string, Sermon>();
  for (const group of chunk(ids, 10)) {
    const snap = await getDocs(
      query(
        collection(db, COLLECTIONS.sermons),
        where(documentId(), "in", group),
      ),
    );
    for (const d of snap.docs) {
      results.set(d.id, mapSermon(d.id, d.data()));
    }
  }
  return ids
    .map((id) => results.get(id))
    .filter((s): s is Sermon => s !== undefined && s.status === "published");
}
