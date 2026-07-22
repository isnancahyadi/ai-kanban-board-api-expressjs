import type { Request, Response } from "express";
import type { AuthenticatedRequest } from "~/middleware";
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

  login = async (req: Request, res: Response) => {
    const data = await this.authService.login(req.body);
    return this.sendSuccess(res, data, "Login successfully");
  };

  me = async (req: AuthenticatedRequest, res: Response) => {
    const me = await this.authService.me(req.user.id);
    return this.sendSuccess(res, me, "Get me successfully");
  };
}
