import type { InferSelectModel } from "drizzle-orm";
import type { NextFunction, Request, Response } from "express";
import type { boardMembersTable, boardsTable } from "~/db/schema";
import type { SignTokenPayload } from "~/types";
import { ApiError, verifyToken } from "~/utils";

export type BoardType = InferSelectModel<typeof boardsTable>;
export type BoardMemberType = InferSelectModel<typeof boardMembersTable>;

export interface AuthRequest extends Request {
  user?: SignTokenPayload;
}

export interface AuthenticatedRequest extends Request {
  user: SignTokenPayload;
  board: Pick<BoardType, "id" | "ownerId"> & Pick<BoardMemberType, "role">;
}

export const requireAuth = (req: AuthRequest, _res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer"))
      throw ApiError.unauthorized("Access denied. Missing authentication token");

    const token = authHeader.split(" ")[1];
    if (!token) throw ApiError.unauthorized("Access denied. Missing authentication token");

    const decoded = verifyToken(token) as SignTokenPayload;
    req.user = decoded;
    next();
  } catch (err) {
    if (err instanceof ApiError) return next(err);
    next(ApiError.unauthorized("Invalid or expired token"));
  }
};
