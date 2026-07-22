import type { Response } from "express";
import type { AuthenticatedRequest } from "~/middleware";
import type { BoardServices } from "~/services/board.service";
import { BaseController } from "./base.controller";

export class BoardController extends BaseController {
  private boardService: BoardServices;

  constructor(boardService: BoardServices) {
    super();
    this.boardService = boardService;
  }

  list = async (req: AuthenticatedRequest, res: Response) => {
    const boardList = await this.boardService.listBoards(req.user.id);
    return this.sendSuccess(res, boardList, "Get list boards successfully");
  };
}
