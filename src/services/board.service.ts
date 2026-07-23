import { and, asc, desc, eq, getTableColumns, or, sql } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";
import { DEFAULT_COLUMNS } from "~/constants";
import db from "~/db";
import { boardMembersTable, boardsTable, columnsTable, tasksTable, usersTable } from "~/db/schema";
import type { BoardRoleType } from "~/types/schema";
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

  async getBoard(boardId: string, boardRole: BoardRoleType) {
    const [boardRes, columnsRes, tasksRes, membersRes] = await Promise.all([
      db.select().from(boardsTable).where(eq(boardsTable.id, boardId)),
      db
        .select()
        .from(columnsTable)
        .where(eq(columnsTable.boardId, boardId))
        .orderBy(asc(columnsTable.position)),
      db
        .select({
          ...getTableColumns(tasksTable),
          assigneeName: sql<string>`${usersTable.name}`.as("assignee_name"),
          assigneeEmail: sql<string>`${usersTable.email}`.as("assignee_email"),
          assigneeAvatar: sql<string>`${usersTable.avatarUrl}`.as("assignee_avatar"),
        })
        .from(tasksTable)
        .leftJoin(usersTable, eq(usersTable.id, tasksTable.assigneeId))
        .where(eq(tasksTable.boardId, boardId))
        .orderBy(asc(tasksTable.position)),
      db
        .select({
          id: usersTable.id,
          name: usersTable.name,
          email: usersTable.email,
          avatarUrl: sql<string>`${usersTable.avatarUrl}`.as("avatar_url"),
          role: boardMembersTable.role,
          joinedAt: sql<string>`${boardMembersTable.joinedAt}`.as("joined_at"),
        })
        .from(boardMembersTable)
        .innerJoin(usersTable, eq(usersTable.id, boardMembersTable.userId))
        .where(eq(boardMembersTable.boardId, boardId))
        .orderBy(asc(boardMembersTable.joinedAt)),
    ]);

    return {
      board: boardRes[0],
      columns: columnsRes,
      tasks: tasksRes,
      members: membersRes,
      role: boardRole,
    };
  }
}
