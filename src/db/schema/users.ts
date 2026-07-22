import * as t from "drizzle-orm/pg-core";
import { pgTable } from "drizzle-orm/pg-core";
import { timestamps } from "./helper";

export const usersTable = pgTable("users", {
  id: t.uuid().primaryKey().unique().defaultRandom(),
  name: t.text().notNull(),
  email: t.text().unique().notNull(),
  password: t.varchar({ length: 255 }).notNull(),
  avatarUrl: t.text("avatar_url"),
  ...timestamps,
});
