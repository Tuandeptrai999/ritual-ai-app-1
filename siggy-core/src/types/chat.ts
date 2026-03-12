export type Sender = "user" | "bot";

export interface ChatMessageType {
  id: string;
  message: string;
  sender: Sender;
  imageBase64?: string;
  isNew?: boolean;
}
