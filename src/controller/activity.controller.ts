import type { Response } from "express";
import type { AuthenticatedRequest } from "~/middleware";
import type { ActivityServices } from "~/services/activity.service";
import { BaseController } from "./base.controller";

export class ActivityController extends BaseController {
  private activityService: ActivityServices;

  constructor(activityService: ActivityServices) {
    super();
    this.activityService = activityService;
  }

  getActivity = async (req: AuthenticatedRequest, res: Response) => {
    const data = await this.activityService.getActivity(req.board.id, req.query.limit as string);
    return this.sendSuccess(res, data, "Get activities successfully");
  };
}
