export interface Notification<T> {
  type: string;
  message: string;
  timestamp: Date;
  data: T;
}
