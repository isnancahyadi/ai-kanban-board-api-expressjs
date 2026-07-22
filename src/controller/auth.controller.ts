import type { Request, Response } from "express";
import type { AuthServices } from "~/services/auth.service";
import { BaseController } from "./base.controller";

export class AuthController extends BaseController {
  private authService: AuthServices;

  constructor(authService: AuthServices) {
    super();
    this.authService = authService;
  }

  register = async (req: Request, res: Response) => {
    const user = await this.authService.register(req.body);
    return this.sendSuccess(res, user, "User registered successfully");
  };
}
