export type NotificationType =
  | "pastorApproved"
  | "pastorRejected"
  | "seedGranted"
  | "system";

export interface Notification {
  id: string;
  uid: string;
  type: NotificationType;
  message: string;
  linkUrl: string | null;
  read: boolean;
  createdAt: number;
}
