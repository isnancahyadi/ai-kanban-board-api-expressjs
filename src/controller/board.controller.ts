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

  listBoards = async (req: AuthenticatedRequest, res: Response) => {
    const boardList = await this.boardService.listBoards(req.user.id);
    return this.sendSuccess(res, boardList, "Get list boards successfully");
  };

  createBoard = async (req: AuthenticatedRequest, res: Response) => {
    const data = await this.boardService.createBoard(req.body, req.user.id);
    return this.sendSuccess(res, data, "Board created");
  };

  getBoard = async (req: AuthenticatedRequest, res: Response) => {
    const board = await this.boardService.getBoard(req.board.id, req.board.role);
    return this.sendSuccess(res, board, "Get board successfully");
  };
}
