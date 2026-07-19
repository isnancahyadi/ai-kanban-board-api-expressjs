import * as t from "drizzle-orm/pg-core";
import { pgTable } from "drizzle-orm/pg-core";
import { boardsTable } from "./boards";
import { timestamps } from "./helper";

export const columnsTable = pgTable("columns", {
  id: t.uuid().primaryKey().unique().defaultRandom(),
  boardId: t.uuid("board_id").notNull().references(() => boardsTable.id, { onDelete: "cascade" }),
  title: t.text().notNull(),
  position: t.doublePrecision().notNull().default(1000),
  ...timestamps
}, (table) => [
  t.index("idx_columns_board").on(table.boardId)
])
