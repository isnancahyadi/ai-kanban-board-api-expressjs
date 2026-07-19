import * as t from "drizzle-orm/pg-core";
import { pgTable } from "drizzle-orm/pg-core";
import { boardsTable } from "./boards";
import { columnsTable } from "./columns";
import { timestamps } from "./helper";
import { usersTable } from "./users";

export const priorityEnum = t.pgEnum("priority", ["low", "medium", "high", "urgent"]);

export const tasksTable = pgTable(
  "tasks",
  {
    id: t.uuid().primaryKey().unique().defaultRandom(),
    boardId: t
      .uuid("board_id")
      .notNull()
      .references(() => boardsTable.id, { onDelete: "cascade" }),
    columnId: t
      .uuid("column_id")
      .notNull()
      .references(() => columnsTable.id, { onDelete: "cascade" }),
    title: t.text().notNull(),
    description: t.text(),
    priority: priorityEnum().default("medium"),
    dueDate: t.timestamp("due_date", { withTimezone: true }),
    assigneeId: t.uuid("assignee_id").references(() => usersTable.id, { onDelete: "set null" }),
    position: t.doublePrecision().notNull().default(1000),
    createdBy: t.uuid("created_by").references(() => usersTable.id, { onDelete: "set null" }),
    ...timestamps,
  },
  (table) => [
    t.index("idx_tasks_board").on(table.boardId),
    t.index("idx_tasks_column").on(table.columnId),
    t.index("idx_tasks_assignee").on(table.assigneeId),
  ],
);
