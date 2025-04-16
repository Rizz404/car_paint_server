import {
  midtransWebhook,
  xenditInvoiceWebhook,
  xenditPaymentRequestWebhook,
} from "@/controller/webhook-controller";
import express from "express";

const webHookrouter = express.Router();

webHookrouter.route("/invoice").post(xenditInvoiceWebhook);
webHookrouter.route("/midtrans").post(midtransWebhook);
webHookrouter.route("/payment-request").post(xenditPaymentRequestWebhook);

export default webHookrouter;
