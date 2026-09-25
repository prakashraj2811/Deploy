import http from "http";
import { Server as SocketIOServer } from "socket.io";
import { createApp } from "./app";
import { env } from "./config/env";
import { registerChatGateway } from "./realtime/chat.gateway";

const app = createApp();
const httpServer = http.createServer(app);

const io = new SocketIOServer(httpServer, {
  cors: { origin: env.frontendUrl, credentials: true },
});

registerChatGateway(io);

httpServer.listen(env.port, () => {
  // eslint-disable-next-line no-console
  console.log(`Matrimony API listening on ${env.backendUrl} [${env.nodeEnv}]`);
});
