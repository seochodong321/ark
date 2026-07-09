import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
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
