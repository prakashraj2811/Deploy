import { apiClient } from "./apiClient";
import type { ApiSuccess } from "@/types/api";

export interface ConversationRow {
  id: string;
  userAId: string;
  userBId: string;
  lastMessageAt: string | null;
}

export interface MessageRow {
  id: string;
  conversationId: string;
  senderId: string;
  body: string;
  attachmentUrl?: string | null;
  readAt: string | null;
  createdAt: string;
}

export async function listConversations() {
  const res = await apiClient.get<ApiSuccess<ConversationRow[]>>("/conversations");
  return res.data.data;
}

export async function getMessages(conversationId: string) {
  const res = await apiClient.get<ApiSuccess<MessageRow[]>>(`/conversations/${conversationId}/messages`);
  return res.data.data;
}
