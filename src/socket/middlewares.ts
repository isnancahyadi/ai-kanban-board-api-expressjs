import type { Socket } from "socket.io";
import type { SignTokenPayload } from "~/types";
import { verifyToken } from "~/utils/jwt.utils";

export const authMiddleware = (socket: Socket, next: (err?: Error) => void) => {
  try {
    const token = socket.handshake.auth?.token as string | undefined;
    if (!token) return next(new Error("Authentication required"));

    const decoded = verifyToken(token) as SignTokenPayload;

    socket.data.user = {
      id: decoded.id,
      name: decoded.name,
      email: decoded.email,
    };

    next();
  } catch (_err) {
    next(new Error("Invalid token"));
  }
};
