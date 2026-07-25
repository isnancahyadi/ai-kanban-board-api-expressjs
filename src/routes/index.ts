import { Router } from "express";
import activityRouter from "./activity.route";
import authRouter from "./auth.route";
import boardRouter from "./board.route";

const apiRouter = Router();

apiRouter.use("/activity", activityRouter);
apiRouter.use("/auth", authRouter);
apiRouter.use("/boards", boardRouter);

export default apiRouter;
