import {
  deleteAllOrder,
  deleteOrder,
  getOrderById,
  getOrders,
  searchOrders,
  updateOrder,
  getCurrentUserOrders,
  getOrdersByWorkshopId,
  createOrderWithMidtrans,
} from "@/controller/order-controller";
import { authMiddleware } from "@/middlewares/auth";
import { parseFiles, uploadFilesToCloudinary } from "@/middlewares/upload-file";
import { validateRequest } from "@/middlewares/validate-request";
import validateRole from "@/middlewares/validate-role";
import {
  createOrderSchema,
  updateOrderSchema,
} from "@/validation/order-validation";
import express from "express";

const orderRouter = express.Router();

orderRouter
  .route("/")
  .get(authMiddleware(), validateRole(["ADMIN", "SUPER_ADMIN"]), getOrders)
  .delete(
    authMiddleware(),
    validateRole(["ADMIN", "SUPER_ADMIN"]),
    deleteAllOrder
  );

orderRouter
  .route("/midtrans")
  .post(
    authMiddleware(),
    parseFiles.array("carColors", 7),
    validateRequest(createOrderSchema),
    uploadFilesToCloudinary("car-colors"),
    createOrderWithMidtrans
  );

orderRouter
  .route("/workshop/:workshopId")
  .get(
    authMiddleware(),
    validateRole(["ADMIN", "SUPER_ADMIN"]),
    getOrdersByWorkshopId
  );

orderRouter.route("/search").get(searchOrders);

orderRouter.route("/user").get(authMiddleware(), getCurrentUserOrders);

orderRouter
  .route("/:orderId")
  .get(getOrderById)
  .patch(
    authMiddleware(),
    validateRole(["ADMIN", "SUPER_ADMIN"]),
    validateRequest(updateOrderSchema),
    updateOrder
  )
  .delete(
    authMiddleware(),
    validateRole(["ADMIN", "SUPER_ADMIN"]),
    deleteOrder
  );

export default orderRouter;
