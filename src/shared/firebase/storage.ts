import {
  deleteObject,
  getDownloadURL,
  ref,
  uploadBytes,
} from "firebase/storage";
import { getFirebaseStorage } from "./client";

const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

/** 이미지를 업로드하고 공개 URL을 반환한다 */
export async function uploadImage(path: string, file: File): Promise<string> {
  if (!file.type.startsWith("image/")) {
    throw new Error("이미지 파일만 업로드할 수 있습니다.");
  }
  if (file.size > MAX_IMAGE_BYTES) {
    throw new Error("이미지는 5MB 이하만 업로드할 수 있습니다.");
  }
  const storageRef = ref(getFirebaseStorage(), path);
  await uploadBytes(storageRef, file, { contentType: file.type });
  return getDownloadURL(storageRef);
}

export function profilePhotoPath(uid: string): string {
  return `users/${uid}/profile-${Date.now()}`;
}

export function sermonCoverPath(uid: string): string {
  return `sermons/${uid}/cover-${Date.now()}`;
}

/** 자료실 첨부 파일 경로 — 원본 파일명을 보존해 다운로드 시 이름이 유지되게 한다 */
export function resourceFilePath(uid: string, fileName: string): string {
  const safe = fileName.replace(/[/\\?%*:|"<>]/g, "_");
  return `resources/${uid}/${Date.now()}-${safe}`;
}

/** 임의 파일 업로드(자료실) — 크기 검증은 호출부·Storage 규칙에서 수행 */
export async function uploadResourceFile(
  path: string,
  file: File,
): Promise<string> {
  const storageRef = ref(getFirebaseStorage(), path);
  await uploadBytes(storageRef, file, {
    contentType: file.type || "application/octet-stream",
  });
  return getDownloadURL(storageRef);
}

/** Storage 파일 삭제 (자료 게시물 삭제 시 정리용, 실패는 무시) */
export async function deleteStorageFile(path: string): Promise<void> {
  await deleteObject(ref(getFirebaseStorage(), path)).catch(() => undefined);
}
