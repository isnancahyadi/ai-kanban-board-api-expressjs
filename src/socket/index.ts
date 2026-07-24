import type { Server as HttpServer } from "node:http";
import { Server } from "socket.io";
import { env } from "~/config/env";
import { setIo } from "./emitter";
import { registerBoardEvents } from "./events";
import { authMiddleware } from "./middlewares";
import type {
  ClientToServerEvents,
  InterServerEvents,
  ServerToClientEvents,
  SocketData,
} from "./types";

export const initSocket = (httpServer: HttpServer) => {
  const io = new Server<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>(
    httpServer,
    {
      cors: {
        origin: env.CLIENT_URL || "http://localhost:3000",
        methods: ["GET", "POST"],
        credentials: true,
      },
    },
  );

  io.use(authMiddleware);

  io.on("connection", (socket) => {
    registerBoardEvents(io, socket);
  });

  setIo(io);
  return io;
};
