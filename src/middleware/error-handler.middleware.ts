import type { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import { HttpStatusCode, type StatusCode } from "~/types";
import { ApiError } from "~/utils";

interface ZodErrorMessageResponse {
  field: string;
  message: string;
}

interface ErrorMessageResponse<T> {
  status: "ERROR" | "FAILED";
  message: string;
  errors: T | null;
}

export const errorHandler = (
  err: Error | unknown,
  _req: Request,
  res: Response<ErrorMessageResponse<unknown>>,
  next: NextFunction,
) => {
  if (res.headersSent) {
    return next(err);
  }

  let statusCode: StatusCode = HttpStatusCode.INTERNAL_SERVER_ERROR;
  let status: "ERROR" | "FAILED" = "ERROR";
  let message: string = "An internal error occured on the server";
  let errors: unknown = null;

  if (err instanceof ZodError) {
    statusCode = HttpStatusCode.UNPROCESSABLE_CONTENT;
    status = "FAILED";
    message = "Validation Error";
    errors = err.issues.map(
      (issue): ZodErrorMessageResponse => ({
        field: issue.path.join("."),
        message: issue.message,
      }),
    );
  } else if (err instanceof ApiError) {
    statusCode = err.statusCode;
    status = err.statusCode >= 500 ? "ERROR" : "FAILED";
    message = err.message;
  } else {
    console.error("🔥 [Unhandled Error]:", err);
  }

  return res.status(statusCode).json({
    status,
    message,
    errors,
  });
};

export const notFoundHandler = (_req: Request, res: Response) => {
  res.status(HttpStatusCode.NOT_FOUND).json({ error: "Route not found" });
};
