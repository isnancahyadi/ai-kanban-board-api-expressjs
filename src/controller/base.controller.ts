import type { Response } from "express";
import type { StatusCode } from "~/types";

export abstract class BaseController {
  protected sendSuccess<T>(
    res: Response,
    data: T | null = null,
    message: string = "Success",
    statusCode: StatusCode = 200,
  ): Response {
    return res.status(statusCode).json({
      status: "OK",
      message,
      data,
    });
  }
}
