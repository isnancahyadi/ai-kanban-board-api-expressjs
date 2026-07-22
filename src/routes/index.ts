import { Router } from "express";
import authRouter from "./auth.route";
import boardRouter from "./board.route";

const apiRouter = Router();

apiRouter.use("/auth", authRouter);
apiRouter.use("/boards", boardRouter);

export default apiRouter;
