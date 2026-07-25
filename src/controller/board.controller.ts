import type { Response } from "express";
import type { AuthenticatedRequest } from "~/middleware";
import type { BoardServices } from "~/services/board.service";
import { emitToBoard, logActivity } from "~/socket/emitter";
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

  updateBoard = async (req: AuthenticatedRequest, res: Response) => {
    const { board } = await this.boardService.updateBoard(req.board.id, req.body);
    emitToBoard(req.board.id, "board:update", board);
    return this.sendSuccess(res, { board }, "Board updated successfully");
  };

  deleteBoard = async (req: AuthenticatedRequest, res: Response) => {
    const data = await this.boardService.deleteBoard(req.board.id, req.board.role);
    emitToBoard(req.board.id, "board:deleted", data);
    return this.sendSuccess(res, null, "Board deleted successfully");
  };

  addMember = async (req: AuthenticatedRequest, res: Response) => {
    const { member } = await this.boardService.addMember(req.board.id, req.board.role, req.body);

    await logActivity({
      boardId: req.board.id,
      userId: req.user.id,
      action: "member.added",
      message: `${req.user.name} added ${member.name} to the board`,
      metadata: { memberId: member.id },
    });

    return this.sendSuccess(res, { member }, "Member added successfully", 201);
  };
}
