import { Router } from "express";
import { BoardController } from "~/controller/board.controller";
import { requireAuth } from "~/middleware";
import { BoardServices } from "~/services/board.service";
import { asyncHandler } from "~/utils";

const boardRouter = Router();

const boardService = new BoardServices();
const boardController = new BoardController(boardService);

boardRouter.use(requireAuth);

boardRouter.get("/", asyncHandler(boardController.listBoards));
boardRouter.post("/", asyncHandler(boardController.createBoard));

export default boardRouter;
