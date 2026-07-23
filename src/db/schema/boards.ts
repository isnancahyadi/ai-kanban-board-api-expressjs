import * as t from "drizzle-orm/pg-core";
import { pgTable } from "drizzle-orm/pg-core";
import { timestamps } from "./helper";
import { usersTable } from "./users";

export const roleEnum = t.pgEnum("role", ["admin", "owner", "member"]);

export const boardsTable = pgTable(
  "boards",
  {
    id: t.uuid().primaryKey().unique().defaultRandom(),
    title: t.text().notNull(),
    description: t.text(),
    color: t.varchar({ length: 7 }).default("#6366F1"),
    ownerId: t
      .uuid("owner_id")
      .notNull()
      .references(() => usersTable.id, { onDelete: "cascade" }),
    ...timestamps,
  },
  (table) => [t.index("idx_boards_owner").on(table.ownerId)],
);

export const boardMembersTable = pgTable(
  "board_members",
  {
    boardId: t
      .uuid("board_id")
      .notNull()
      .references(() => boardsTable.id, { onDelete: "cascade" }),
    userId: t
      .uuid("user_id")
      .notNull()
      .references(() => usersTable.id, { onDelete: "cascade" }),
    role: roleEnum().default("member").notNull(),
    joinedAt: t.timestamp("joined_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    t.primaryKey({ columns: [table.boardId, table.userId] }),
    t.index("idx_member_users").on(table.userId),
  ],
);
