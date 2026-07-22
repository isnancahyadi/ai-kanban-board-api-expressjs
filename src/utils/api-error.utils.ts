import { HttpStatusCode, type StatusCode, type StatusMessage } from "~/types";

export class ApiError extends Error {
  public readonly statusCode: StatusCode;
  public readonly isApiError: boolean;

  constructor(statusCode: StatusCode, message: StatusMessage | string) {
    super(message);
    this.statusCode = statusCode;
    this.isApiError = true;
  }

  static badRequest(message: StatusMessage | string = "BAD_REQUEST") {
    return new ApiError(HttpStatusCode.BAD_REQUEST, message);
  }
  static unauthorized(message: StatusMessage | string = "UNAUTHORIZED") {
    return new ApiError(HttpStatusCode.UNAUTHORIZED, message);
  }
  static forbidden(message: StatusMessage | string = "FORBIDDEN") {
    return new ApiError(HttpStatusCode.FORBIDDEN, message);
  }
  static notFound(message: StatusMessage | string = "NOT_FOUND") {
    return new ApiError(HttpStatusCode.NOT_FOUND, message);
  }
  static methodNotAllowed(message: StatusMessage | string = "METHOD_NOT_ALLOWED") {
    return new ApiError(HttpStatusCode.METHOD_NOT_ALLOWED, message);
  }
  static conflict(message: StatusMessage | string = "CONFLICT") {
    return new ApiError(HttpStatusCode.CONFLICT, message);
  }
  static unprocessableContent(message: StatusMessage | string = "UNPROCESSABLE_CONTENT") {
    return new ApiError(HttpStatusCode.UNPROCESSABLE_CONTENT, message);
  }
  static internalServerError(message: StatusMessage | string = "INTERNAL_SERVER_ERROR") {
    return new ApiError(HttpStatusCode.INTERNAL_SERVER_ERROR, message);
  }
}
