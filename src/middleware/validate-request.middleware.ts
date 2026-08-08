import type { NextFunction, Request, Response } from "express";
import { ZodError, type ZodObject } from "zod";
import { HttpStatusCode } from "~/types";

export const validateRequest =
  (schema: ZodObject) => async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema.parseAsync(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errorMessages = error.issues.map((issue) => ({
          field: issue.path.join("."),
          message: issue.message,
        }));

        res.status(HttpStatusCode.UNPROCESSABLE_CONTENT).json({
          status: "FAILED",
          message: "Validation Error",
          errors: errorMessages,
        });
      }

      next(error);
    }
  };
