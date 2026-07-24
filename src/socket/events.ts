import { and, eq, or } from "drizzle-orm";
import type { Server, Socket } from "socket.io";
import db from "~/db";
import { boardMembersTable, boardsTable } from "~/db/schema/boards";
import { boardRoom } from "./emitter";
import type {
  ClientToServerEvents,
  InterServerEvents,
  ServerToClientEvents,
  SocketData,
  SocketUser,
} from "./types";

type TypedSocket = Socket<
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData
>;
type TypedServer = Server<
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData
>;

const userCanAccessBoard = async (userId: string, boardId: string) => {
  const result = await db
    .select({ id: boardsTable.id })
    .from(boardsTable)
    .leftJoin(
      boardMembersTable,
      and(eq(boardMembersTable.boardId, boardsTable.id), eq(boardMembersTable.userId, userId)),
    )
    .where(
      and(
        eq(boardsTable.id, boardId),
        or(eq(boardsTable.ownerId, userId), eq(boardMembersTable.userId, userId)),
      ),
    )
    .limit(1);

  return result.length > 0;
};

export const registerBoardEvents = (io: TypedServer, socket: TypedSocket) => {
  const user = socket.data.user;

  socket.on("board:join", async (boardId, ack) => {
    try {
      if (!(await userCanAccessBoard(user.id, boardId))) {
        if (ack) ack({ ok: false, error: "No access to this board" });
        return;
      }

      const room = boardRoom(boardId);
      socket.join(room);

      socket.to(room).emit("presence:join", {
        user: { id: user.id, name: user.name },
        boardId,
      });

      const sockets = await io.in(room).fetchSockets();
      const seen = new Set([user.id]);
      const viewers: Omit<SocketUser, "email">[] = [];

      for (const s of sockets) {
        const u = s.data.user;
        if (!u || seen.has(u.id)) continue;
        seen.add(u.id);
        viewers.push({ id: u.id, name: u.name });
      }
      socket.emit("presence:sync", { boardId, users: viewers });

      if (ack) ack({ ok: true });
    } catch (_err) {
      if (ack) ack({ ok: false, error: "Failed to join board" });
    }
  });

  socket.on("board:leave", (boardId) => {
    socket.leave(boardRoom(boardId));
    socket.to(boardRoom(boardId)).emit("presence:leave", {
      user: { id: user.id, name: user.name },
      boardId,
    });
  });

  socket.on("presence:cursor", ({ boardId, x, y }) => {
    socket.to(boardRoom(boardId)).emit("presence:cursor", {
      user: { id: user.id, name: user.name },
      x,
      y,
    });
  });

  socket.on("disconnecting", () => {
    for (const room of socket.rooms) {
      if (room === socket.id) continue;
      socket.to(room).emit("presence:leave", {
        user: { id: user.id, name: user.name },
      });
    }
  });
};
