import { and, desc, eq, getTableColumns, or, sql } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";
import { DEFAULT_COLUMNS } from "~/constants";
import db from "~/db";
import { boardMembersTable, boardsTable, columnsTable, tasksTable } from "~/db/schema";
import { ApiError } from "~/utils";
import type { BoardInputType } from "~/validation/board.validation";

export class BoardServices {
  async listBoards(userId: string) {
    const mm = alias(boardMembersTable, "mm");

    const rows = await db
      .select({
        ...getTableColumns(boardsTable),
        isOwner: eq(boardsTable.ownerId, userId).as("is_owner"),
        taskCount: db
          .select({ count: sql<number>`COUNT(*)`.mapWith(Number).as("task_count") })
          .from(tasksTable)
          .where(eq(tasksTable.boardId, boardsTable.id))
          .as("task_count"),
        memberCount: db
          .select({ count: sql<number>`COUNT(*)`.mapWith(Number).as("member_count") })
          .from(boardMembersTable)
          .where(eq(boardMembersTable.boardId, boardsTable.id))
          .as("member_count"),
      })
      .from(boardsTable)
      .leftJoin(mm, and(eq(mm.boardId, boardsTable.id), eq(mm.userId, userId)))
      .where(or(eq(boardsTable.ownerId, userId), eq(mm.userId, userId)))
      .orderBy(desc(boardsTable.updatedAt));

    return {
      boards: rows,
    };
  }

  async createBoard(data: BoardInputType, userId: string) {
    const board = await db.transaction(async (tx) => {
      const rows = await tx
        .insert(boardsTable)
        .values({
          title: data.title,
          description: data.description,
          color: data.color,
          ownerId: userId,
        })
        .returning();
      const rowData = rows[0];

      if (!rowData) throw ApiError.internalServerError("Failed to create board");
      await tx.insert(boardMembersTable).values({
        boardId: rowData.id,
        userId,
        role: "owner",
      });

      for (const [i, columnTitle] of DEFAULT_COLUMNS.entries()) {
        await tx.insert(columnsTable).values({
          boardId: rowData.id,
          title: columnTitle,
          position: (i + 1) * 1000,
        });
      }
      return rowData;
    });

    return { board };
  }
}
