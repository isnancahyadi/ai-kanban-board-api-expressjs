import { and, desc, eq, getTableColumns, or, sql } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";
import db from "~/db";
import { boardMembersTable, boardsTable, tasksTable } from "~/db/schema";

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
}
