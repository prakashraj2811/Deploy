import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Loader2, Send, MessageCircle } from "lucide-react";
import { getSocket } from "@/services/socket";
import * as conversationService from "@/services/conversation.service";
import type { ConversationRow, MessageRow } from "@/services/conversation.service";
import { useAuthStore } from "@/store/authStore";

export default function Messages() {
  const [searchParams] = useSearchParams();
  const peerFromQuery = searchParams.get("with");
  const myUserId = useAuthStore((s) => s.user?.userId);

  const [conversations, setConversations] = useState<ConversationRow[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<MessageRow[]>([]);
  const [draft, setDraft] = useState("");
  const [loading, setLoading] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const socket = getSocket();

    conversationService
      .listConversations()
      .then((list) => {
        setConversations(list);
        if (peerFromQuery) {
          socket.emit("conversation:join", peerFromQuery);
        } else if (list[0]) {
          setActiveConversationId(list[0].id);
        }
      })
      .catch(() => setConversations([]))
      .finally(() => setLoading(false));

    socket.on("conversation:joined", ({ conversationId }: { conversationId: string }) => {
      setActiveConversationId(conversationId);
    });

    socket.on("message:new", (message: MessageRow) => {
      setMessages((prev) => (prev.some((m) => m.id === message.id) ? prev : [...prev, message]));
    });

    return () => {
      socket.off("conversation:joined");
      socket.off("message:new");
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!activeConversationId) return;
    conversationService.getMessages(activeConversationId).then(setMessages);
    getSocket().emit("message:read", { conversationId: activeConversationId });
  }, [activeConversationId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  function handleSelectConversation(peerUserId: string) {
    getSocket().emit("conversation:join", peerUserId);
  }

  function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!draft.trim() || !activeConversationId) return;
    getSocket().emit("message:send", { conversationId: activeConversationId, body: draft.trim() });
    setDraft("");
  }

  if (loading) {
    return <div className="flex min-h-[50vh] items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-brand-500" /></div>;
  }

  return (
    <div className="card grid h-[calc(100vh-8rem)] grid-cols-1 overflow-hidden md:grid-cols-[280px_1fr]">
      <aside className="hidden border-r border-ink-100 md:block">
        <div className="border-b border-ink-100 p-4 font-semibold text-ink-800">Conversations</div>
        <div className="overflow-y-auto">
          {conversations.length === 0 ? (
            <p className="p-4 text-sm text-ink-500">No conversations yet.</p>
          ) : (
            conversations.map((c) => {
              const peerId = c.userAId === myUserId ? c.userBId : c.userAId;
              return (
                <button
                  key={c.id}
                  onClick={() => handleSelectConversation(peerId)}
                  className={`flex w-full items-center gap-3 px-4 py-3 text-left text-sm hover:bg-ink-50 ${activeConversationId === c.id ? "bg-brand-50" : ""}`}
                >
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-ink-100 text-ink-500">
                    <MessageCircle className="h-4 w-4" />
                  </span>
                  <span className="font-medium text-ink-800">Conversation</span>
                </button>
              );
            })
          )}
        </div>
      </aside>

      <div className="flex flex-col">
        {!activeConversationId ? (
          <div className="flex flex-1 items-center justify-center text-sm text-ink-500">Select a conversation to start chatting.</div>
        ) : (
          <>
            <div className="flex-1 space-y-3 overflow-y-auto p-4">
              {messages.map((m) => {
                const mine = m.senderId === myUserId;
                return (
                  <div key={m.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-xs rounded-2xl px-4 py-2 text-sm ${mine ? "bg-brand-500 text-white" : "bg-ink-100 text-ink-800"}`}>
                      {m.body}
                    </div>
                  </div>
                );
              })}
              <div ref={bottomRef} />
            </div>
            <form onSubmit={handleSend} className="flex items-center gap-2 border-t border-ink-100 p-3">
              <input
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="Type a message..."
                className="input flex-1"
              />
              <button type="submit" className="btn-primary !px-3.5">
                <Send className="h-4 w-4" />
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
