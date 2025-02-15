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
import { validateRequest } from "@/middlewares/validate-request";
import validateRole from "@/middlewares/validate-role";
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
  .post(
    authMiddleware(),
    validateRole(["ADMIN", "SUPER_ADMIN"]),
    validateRequest(createETicketSchema),
    createETicket
  )
  .delete(
    authMiddleware(),
    validateRole(["ADMIN", "SUPER_ADMIN"]),
    deleteAllETicket
  );

eTicketRouter.route("/user").get(authMiddleware(), getCurrentUserETickets);

eTicketRouter
  .route("/multiple")
  .post(
    authMiddleware(),
    validateRole(["ADMIN", "SUPER_ADMIN"]),
    validateRequest(createManyETicketSchema),
    createManyETickets
  );

eTicketRouter.route("/search").get(searchETickets);
eTicketRouter
  .route("/:eTicketId")
  .get(getETicketById)
  .patch(
    authMiddleware(),
    validateRole(["ADMIN", "SUPER_ADMIN"]),
    validateRequest(updateETicketSchema),
    updateETicket
  )
  .delete(
    authMiddleware(),
    validateRole(["ADMIN", "SUPER_ADMIN"]),
    deleteETicket
  );

export default eTicketRouter;
