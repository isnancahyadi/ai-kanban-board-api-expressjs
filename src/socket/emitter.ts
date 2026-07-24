import type { Server } from "socket.io";
import db from "~/db";
import { activitiesTable } from "~/db/schema/activities";
import type {
  ClientToServerEvents,
  InterServerEvents,
  ServerToClientEvents,
  SocketData,
} from "./types";

type TypedServer = Server<
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData
>;

let io: TypedServer | null = null;

export const setIo = (instance: TypedServer) => {
  io = instance;
};

export const getIo = () => io;

export const boardRoom = (boardId: string) => `board:${boardId}`;

export const emitToBoard = <Ev extends keyof ServerToClientEvents>(
  boardId: string,
  event: Ev,
  ...args: Parameters<ServerToClientEvents[Ev]>
) => {
  if (io) io.to(boardRoom(boardId)).emit(event, ...args);
};

export const logActivity = async ({
  boardId,
  userId,
  action,
  message,
  metadata,
}: {
  boardId: string;
  userId?: string | null;
  action: string;
  message: string;
  metadata?: Record<string, unknown>;
}) => {
  const [activity] = await db
    .insert(activitiesTable)
    .values({
      boardId,
      userId: userId || null,
      action,
      message,
      metadata: metadata ? metadata : null,
    })
    .returning();

  if (activity) {
    emitToBoard(boardId, "activity:new", activity);
  }
  return activity;
};
