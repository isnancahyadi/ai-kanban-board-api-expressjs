import { and, asc, desc, eq, getTableColumns, or, sql } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";
import { DEFAULT_COLUMNS } from "~/constants";
import db from "~/db";
import { boardMembersTable, boardsTable, columnsTable, tasksTable, usersTable } from "~/db/schema";
import type { BoardRoleType } from "~/types/schema";
import { ApiError } from "~/utils";
import type {
  AddMemberInputType,
  CreateBoardInputType,
  UpdateBoardInputType,
} from "~/validation/board.validation";

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

  async createBoard(data: CreateBoardInputType, userId: string) {
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
    const boardQuery = db.select().from(boardsTable).where(eq(boardsTable.id, boardId));

    const columnsQuery = db
      .select()
      .from(columnsTable)
      .where(eq(columnsTable.boardId, boardId))
      .orderBy(asc(columnsTable.position));

    const tasksQuery = db
      .select({
        ...getTableColumns(tasksTable),
        assigneeName: usersTable.name,
        assigneeEmail: usersTable.email,
        assigneeAvatar: usersTable.avatarUrl,
      })
      .from(tasksTable)
      .leftJoin(usersTable, eq(usersTable.id, tasksTable.assigneeId))
      .where(eq(tasksTable.boardId, boardId))
      .orderBy(asc(tasksTable.position));

    const membersQuery = db
      .select({
        id: usersTable.id,
        name: usersTable.name,
        email: usersTable.email,
        avatarUrl: usersTable.avatarUrl,
        role: boardMembersTable.role,
        joinedAt: boardMembersTable.joinedAt,
      })
      .from(boardMembersTable)
      .innerJoin(usersTable, eq(usersTable.id, boardMembersTable.userId))
      .where(eq(boardMembersTable.boardId, boardId))
      .orderBy(asc(boardMembersTable.joinedAt));

    const [boardRes, columnsRes, tasksRes, membersRes] = await Promise.all([
      boardQuery,
      columnsQuery,
      tasksQuery,
      membersQuery,
    ]);

    return {
      board: boardRes[0],
      columns: columnsRes,
      tasks: tasksRes,
      members: membersRes,
      role: boardRole,
    };
  }

  async updateBoard(boardId: string, data: UpdateBoardInputType) {
    const rows = await db
      .update(boardsTable)
      .set({
        ...data,
      })
      .where(eq(boardsTable.id, boardId))
      .returning();

    const rowData = rows[0];
    if (!rowData) throw ApiError.internalServerError("Failed to update board");

    return { board: rowData };
  }

  async deleteBoard(boardId: string, boardRole: BoardRoleType) {
    if (boardRole !== "owner") {
      throw ApiError.forbidden("Only the owner can delete this board");
    }

    await db.delete(boardsTable).where(eq(boardsTable.id, boardId));

    return { id: boardId };
  }

  async addMember(boardId: string, boardRole: BoardRoleType, data: AddMemberInputType) {
    if (boardRole !== "owner" && boardRole !== "admin")
      throw ApiError.forbidden("Only owners or admins can add members");

    const userRes = await db
      .select({
        id: usersTable.id,
        name: usersTable.name,
        email: usersTable.email,
        avatarUrl: usersTable.avatarUrl,
      })
      .from(usersTable)
      .where(eq(usersTable.email, data.email))
      .limit(1);

    const user = userRes[0];
    if (!user) throw ApiError.notFound("No user found with that email");

    await db
      .insert(boardMembersTable)
      .values({
        boardId,
        userId: user.id,
        role: data.role,
      })
      .onConflictDoUpdate({
        target: [boardMembersTable.boardId, boardMembersTable.userId],
        set: { role: data.role },
      });

    return {
      member: {
        ...user,
        role: data.role,
      },
    };
  }

  async removeMember({
    boardId,
    boardRole,
    ownerId,
    userId,
  }: {
    boardId: string;
    boardRole: BoardRoleType;
    ownerId: string;
    userId: string;
  }) {
    if (boardRole !== "owner" && boardRole !== "admin")
      throw ApiError.forbidden("Only owners or admins can remove members");
    if (userId === ownerId) throw ApiError.badRequest("Cannot remove the board owner");

    await db
      .delete(boardMembersTable)
      .where(and(eq(boardMembersTable.boardId, boardId), eq(boardMembersTable.userId, userId)));

    return { success: true };
  }
}
