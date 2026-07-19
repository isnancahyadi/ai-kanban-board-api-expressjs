import { sql } from "drizzle-orm";
import * as t from "drizzle-orm/pg-core";
import { pgTable } from "drizzle-orm/pg-core";
import { boardsTable } from "./boards";
import { timestamps } from "./helper";
import { usersTable } from "./users";

export const activitiesTable = pgTable(
  "activities",
  {
    id: t.uuid().primaryKey().unique().defaultRandom(),
    boardId: t
      .uuid("board_id")
      .notNull()
      .references(() => boardsTable.id, { onDelete: "cascade" }),
    userId: t.uuid("user_id").references(() => usersTable.id, { onDelete: "set null" }),
    action: t.text().notNull(),
    message: t.text().notNull(),
    metadata: t.jsonb(),
    ...timestamps,
  },
  (table) => [t.index("idx_activities_board").on(table.boardId, sql`${table.createdAt} DESC`)],
);
