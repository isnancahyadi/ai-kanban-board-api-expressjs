import type { Response } from "express";
import snakecaseKeys from "snakecase-keys";
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
      data: data ? snakecaseKeys(data, { deep: true }) : null,
    });
  }
}
