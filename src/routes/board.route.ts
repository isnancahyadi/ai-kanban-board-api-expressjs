import { Router } from "express";
import { BoardController } from "~/controller/board.controller";
import { requireAuth, requireBoardAccess } from "~/middleware";
import { BoardServices } from "~/services/board.service";
import { asyncHandler } from "~/utils";

const boardRouter = Router();

const boardService = new BoardServices();
const boardController = new BoardController(boardService);

boardRouter.use(requireAuth);

boardRouter.get("/", asyncHandler(boardController.listBoards));
boardRouter.post("/", asyncHandler(boardController.createBoard));

boardRouter.get("/:boardId", requireBoardAccess, asyncHandler(boardController.getBoard));
boardRouter.patch("/:boardId", requireBoardAccess, asyncHandler(boardController.updateBoard));

export default boardRouter;
