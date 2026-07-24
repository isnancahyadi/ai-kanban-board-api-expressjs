import type { InferSelectModel } from "drizzle-orm";
import type { activitiesTable, boardsTable } from "~/db/schema";

export interface SocketUser {
  id: string;
  name: string;
  email: string;
}

export type Activity = InferSelectModel<typeof activitiesTable>;
export type Board = InferSelectModel<typeof boardsTable>;

export interface ServerToClientEvents {
  "presence:join": (data: { user: Omit<SocketUser, "email">; boardId: string }) => void;
  "presence:sync": (data: { boardId: string; users: Omit<SocketUser, "email">[] }) => void;
  "presence:leave": (data: { user: Omit<SocketUser, "email">; boardId?: string }) => void;
  "presence:cursor": (data: { user: Omit<SocketUser, "email">; x: number; y: number }) => void;
  "activity:new": (activity: Activity) => void;
  "board:update": (board: Board) => void;
}

export interface ClientToServerEvents {
  "board:join": (boardId: string, ack?: (res: { ok: boolean; error?: string }) => void) => void;
  "board:leave": (boardId: string) => void;
  "presence:cursor": (data: { boardId: string; x: number; y: number }) => void;
}

export type InterServerEvents = Record<string, never>;

export interface SocketData {
  user: SocketUser;
}
