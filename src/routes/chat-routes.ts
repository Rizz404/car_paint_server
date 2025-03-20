import {
  getOrCreateChatRoom,
  getUserChatRooms,
} from "@/controller/chat-controller";
import { authMiddleware } from "@/middlewares/auth";
import { validateRequest } from "@/middlewares/validate-request";
import validateRole from "@/middlewares/validate-role";
import express from "express";

const chatRouter = express.Router();

chatRouter.get("/user/chat-room", getOrCreateChatRoom);
chatRouter.get("/chat-room", getUserChatRooms);

export default chatRouter;
