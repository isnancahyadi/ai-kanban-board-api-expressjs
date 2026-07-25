import { Router } from "express";
import { BoardController } from "~/controller/board.controller";
import { requireAuth, requireBoardAccess, validateRequest } from "~/middleware";
import { BoardServices } from "~/services/board.service";
import { asyncHandler } from "~/utils";
import {
  AddMemberSchema,
  CreateBoardSchema,
  UpdateBoardSchema,
} from "~/validation/board.validation";

const boardRouter = Router();

const boardService = new BoardServices();
const boardController = new BoardController(boardService);

boardRouter.use(requireAuth);

boardRouter.get("/", asyncHandler(boardController.listBoards));
boardRouter.post(
  "/",
  validateRequest(CreateBoardSchema),
  asyncHandler(boardController.createBoard),
);

boardRouter.get("/:boardId", requireBoardAccess, asyncHandler(boardController.getBoard));
boardRouter.patch(
  "/:boardId",
  requireBoardAccess,
  validateRequest(UpdateBoardSchema),
  asyncHandler(boardController.updateBoard),
);
boardRouter.delete("/:boardId", requireBoardAccess, asyncHandler(boardController.deleteBoard));

boardRouter.post(
  "/:boardId/members",
  requireBoardAccess,
  validateRequest(AddMemberSchema),
  asyncHandler(boardController.addMember),
);

export default boardRouter;
