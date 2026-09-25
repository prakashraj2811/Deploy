import { Server as SocketIOServer, Socket } from "socket.io";
import { prisma } from "../config/prisma";
import { verifyAccessToken } from "../utils/tokens";

interface AuthedSocket extends Socket {
  userId?: string;
}

function conversationRoom(conversationId: string) {
  return `conversation:${conversationId}`;
}

async function findOrCreateConversation(userA: string, userB: string) {
  const [a, b] = [userA, userB].sort();
  return prisma.conversation.upsert({
    where: { userAId_userBId: { userAId: a, userBId: b } },
    update: {},
    create: { userAId: a, userBId: b },
  });
}

/**
 * Minimal real-time chat gateway: JWT-authenticated handshake, per-conversation rooms,
 * online presence via connected sockets, typing indicators, and persisted messages.
 * Message access rules (privacy/subscription gating) are enforced in profile.service /
 * privacy settings before a conversation is allowed to be created from the REST layer.
 */
export function registerChatGateway(io: SocketIOServer) {
  const onlineUsers = new Map<string, Set<string>>(); // userId -> socketIds

  io.use((socket: AuthedSocket, next) => {
    try {
      const token = socket.handshake.auth?.token as string | undefined;
      if (!token) return next(new Error("Missing auth token"));
      const payload = verifyAccessToken(token);
      socket.userId = payload.userId;
      next();
    } catch {
      next(new Error("Invalid auth token"));
    }
  });

  io.on("connection", (socket: AuthedSocket) => {
    const userId = socket.userId!;
    if (!onlineUsers.has(userId)) onlineUsers.set(userId, new Set());
    onlineUsers.get(userId)!.add(socket.id);
    io.emit("presence:update", { userId, online: true });

    socket.on("conversation:join", async (peerUserId: string) => {
      const conversation = await findOrCreateConversation(userId, peerUserId);
      socket.join(conversationRoom(conversation.id));
      socket.emit("conversation:joined", { conversationId: conversation.id });
    });

    socket.on("message:send", async (payload: { conversationId: string; body: string; attachmentUrl?: string }) => {
      const message = await prisma.message.create({
        data: {
          conversationId: payload.conversationId,
          senderId: userId,
          body: payload.body,
          attachmentUrl: payload.attachmentUrl,
        },
      });
      await prisma.conversation.update({ where: { id: payload.conversationId }, data: { lastMessageAt: new Date() } });
      io.to(conversationRoom(payload.conversationId)).emit("message:new", message);
    });

    socket.on("message:read", async (payload: { conversationId: string }) => {
      await prisma.message.updateMany({
        where: { conversationId: payload.conversationId, senderId: { not: userId }, readAt: null },
        data: { readAt: new Date() },
      });
      socket.to(conversationRoom(payload.conversationId)).emit("message:read", { conversationId: payload.conversationId, readBy: userId });
    });

    socket.on("typing:start", (payload: { conversationId: string }) => {
      socket.to(conversationRoom(payload.conversationId)).emit("typing:start", { conversationId: payload.conversationId, userId });
    });

    socket.on("typing:stop", (payload: { conversationId: string }) => {
      socket.to(conversationRoom(payload.conversationId)).emit("typing:stop", { conversationId: payload.conversationId, userId });
    });

    socket.on("disconnect", () => {
      onlineUsers.get(userId)?.delete(socket.id);
      if (onlineUsers.get(userId)?.size === 0) {
        onlineUsers.delete(userId);
        io.emit("presence:update", { userId, online: false });
      }
    });
  });
}
