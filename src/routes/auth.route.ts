import { Router } from "express";
import { AuthController } from "~/controller/auth.controller";
import { validateRequest } from "~/middleware";
import { AuthServices } from "~/services/auth.service";
import { asyncHandler } from "~/utils";
import { LoginSchema, RegisterSchema } from "~/validation/auth.validation";

const authRouter = Router();

const authService = new AuthServices();
const authController = new AuthController(authService);

authRouter.post(
  "/register",
  validateRequest(RegisterSchema),
  asyncHandler(authController.register),
);
authRouter.post("/login", validateRequest(LoginSchema), asyncHandler(authController.login));

export default authRouter;
