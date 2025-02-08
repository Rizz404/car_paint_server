import {
  createETicket,
  createManyETickets,
  deleteAllETicket,
  deleteETicket,
  getCurrentUserETickets,
  getETicketById,
  getETickets,
  searchETickets,
  updateETicket,
} from "@/controller/e-ticket-controller";
import { authMiddleware } from "@/middlewares/auth";
import { validateBody } from "@/middlewares/validate-body";
import {
  createETicketSchema,
  createManyETicketSchema,
  updateETicketSchema,
} from "@/validation/e-ticket-validation";
import express from "express";

const eTicketRouter = express.Router();

eTicketRouter
  .route("/")
  .get(getETickets)
  .post(authMiddleware(), validateBody(createETicketSchema), createETicket)
  .delete(authMiddleware(), deleteAllETicket);

eTicketRouter.route("/user").get(authMiddleware(), getCurrentUserETickets);

eTicketRouter
  .route("/multiple")
  .post(
    authMiddleware(),
    validateBody(createManyETicketSchema),
    createManyETickets
  );

eTicketRouter.route("/search").get(searchETickets);
eTicketRouter
  .route("/:eTicketId")
  .get(getETicketById)
  .patch(authMiddleware(), validateBody(updateETicketSchema), updateETicket)
  .delete(authMiddleware(), deleteETicket);

export default eTicketRouter;
