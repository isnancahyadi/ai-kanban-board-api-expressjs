import { and, eq, sql } from "drizzle-orm";
import type { NextFunction, Response } from "express";
import db from "~/db";
import { boardMembersTable, boardsTable } from "~/db/schema";
import type { BoardRoleType } from "~/types/schema";
import { ApiError, asyncHandler } from "~/utils";
import type { AuthenticatedRequest } from "./auth.middleware";

export const requireBoardAccess = asyncHandler(
  async (req: AuthenticatedRequest, _res: Response, next: NextFunction) => {
    const boardId = req.params.boardId;
    const userId = req.user.id;

    if (!boardId) throw ApiError.badRequest("Board ID is required");

    const [board] = await db
      .select({
        id: boardsTable.id,
        ownerId: sql<string>`${boardsTable.ownerId}`.as("owner_id"),
        role: boardMembersTable.role,
      })
      .from(boardsTable)
      .leftJoin(
        boardMembersTable,
        and(eq(boardMembersTable.boardId, boardsTable.id), eq(boardMembersTable.userId, userId)),
      )
      .where(eq(boardsTable.id, String(boardId)))
      .limit(1);

    if (!board) throw ApiError.notFound("Board not found");

    let finalRole: BoardRoleType;

    if (board.ownerId === userId) {
      finalRole = "owner";
    } else if (board.role) {
      finalRole = board.role;
    } else {
      throw ApiError.forbidden("You do not have access to this board");
    }

    req.board = {
      id: board.id,
      ownerId: board.ownerId,
      role: finalRole,
    };

    next();
  },
);
