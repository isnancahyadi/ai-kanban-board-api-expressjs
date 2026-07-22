import jwt from "jsonwebtoken";
import { env } from "~/config/env";
import type { SignTokenPayload } from "~/types";

export const signToken = (payload: SignTokenPayload) =>
  jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: (env.JWT_EXPIRES_IN || "7d") as jwt.SignOptions["expiresIn"],
  });

export const verifyToken = (token: string) => jwt.verify(token, env.JWT_SECRET);
