import { Router } from "express";
import { ActivityController } from "~/controller/activity.controller";
import { requireAuth, requireBoardAccess } from "~/middleware";
import { ActivityServices } from "~/services/activity.service";
import { asyncHandler } from "~/utils";

const activityRouter = Router();

const activityService = new ActivityServices();
const activityController = new ActivityController(activityService);

activityRouter.use(requireAuth);

activityRouter.get(
  "/:boardId/activity",
  requireBoardAccess,
  asyncHandler(activityController.getActivity),
);

export default activityRouter;
