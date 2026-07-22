import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import db from "~/db";
import { usersTable } from "~/db/schema";
import { ApiError, formatUserResponse, signToken } from "~/utils";
import type { LoginInputType, RegisterInputType } from "~/validation/auth.validation";

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

    if (!newUser) throw ApiError.internalServerError("Failed to create user");

    const token = signToken({
      id: newUser.id,
      email: newUser.email,
      name: newUser.name,
    });

    return {
      user: formatUserResponse(newUser),
      token,
    };
  }

  async login(data: LoginInputType) {
    const user = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, data.email))
      .limit(1);

    const foundUser = user[0];
    if (!foundUser) throw ApiError.unauthorized("Invalid email or password");

    const isPasswordMatch = await bcrypt.compare(data.password, foundUser.password);
    if (!isPasswordMatch) throw ApiError.unauthorized("Invalid email or password");

    const token = signToken({ id: foundUser.id, name: foundUser.name, email: foundUser.email });

    return {
      user: formatUserResponse(foundUser),
      token,
    };
  }

  async me(id: string) {
    const me = await db
      .select({
        id: usersTable.id,
        name: usersTable.name,
        avatarUrl: usersTable.avatarUrl,
        createdAt: usersTable.createdAt,
      })
      .from(usersTable)
      .where(eq(usersTable.id, id))
      .limit(1);

    if (!me.length) throw ApiError.notFound("User not found");

    return me[0];
  }
}
