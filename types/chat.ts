export type ChatRole = "assistant" | "user";

export type ChatMessage = {
  id: string;
  role: ChatRole;
  content: string;
  ts: number;
};

export type QuickActionKey = "progress" | "expense" | "noise";

