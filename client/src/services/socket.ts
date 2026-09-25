import { io, Socket } from "socket.io-client";
import { useAuthStore } from "@/store/authStore";

let socket: Socket | null = null;

export function getSocket(): Socket {
  if (socket) return socket;

  socket = io(import.meta.env.VITE_SOCKET_URL, {
    auth: { token: useAuthStore.getState().accessToken },
    autoConnect: true,
  });

  return socket;
}

export function disconnectSocket() {
  socket?.disconnect();
  socket = null;
}
