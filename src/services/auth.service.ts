import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import db from "~/db";
import { usersTable } from "~/db/schema";
import { ApiError, signToken } from "~/utils";
import type { RegisterInputType } from "~/validation/auth.validation";

export class AuthServices {
  async register(data: RegisterInputType) {
    const existingUser = await db
      .select({
        id: usersTable.id,
      })
      .from(usersTable)
      .where(eq(usersTable.email, data.email))
      .limit(1);

    if (existingUser.length) throw ApiError.conflict("Email is already registered");

    const hashedPassword = await bcrypt.hash(data.password, 10);

    const insertData = await db
      .insert(usersTable)
      .values({
        name: data.name,
        email: data.email,
        password: hashedPassword,
      })
      .returning({
        id: usersTable.id,
        name: usersTable.name,
        email: usersTable.email,
        avatar_url: usersTable.avatarUrl,
        created_at: usersTable.createdAt,
      });

    const newUser = insertData[0];

    if (!newUser) {
      throw ApiError.internalServerError("Failed to create user");
    }

    const token = signToken({
      id: newUser.id,
      email: newUser.email,
      name: newUser.name,
    });

    return {
      user: newUser,
      token,
    };
  }
}
