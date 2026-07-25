import { desc, eq, getTableColumns } from "drizzle-orm";
import db from "~/db";
import { activitiesTable, usersTable } from "~/db/schema";

export class ActivityServices {
  async getActivity(boardId: string, limitInput?: string | number) {
    const limit = Math.min(Number(limitInput) || 30, 100);

    const rows = await db
      .select({
        ...getTableColumns(activitiesTable),
        userName: usersTable.name,
        userAvatar: usersTable.avatarUrl,
      })
      .from(activitiesTable)
      .leftJoin(usersTable, eq(usersTable.id, activitiesTable.userId))
      .where(eq(activitiesTable.boardId, boardId))
      .orderBy(desc(activitiesTable.createdAt))
      .limit(limit);

    return { activities: rows };
  }
}
