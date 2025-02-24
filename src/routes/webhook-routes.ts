import {
  xenditInvoiceWebhook,
  xenditPaymentRequestWebhook,
} from "@/controller/webhook-controller";
import express from "express";

const webHookrouter = express.Router();

webHookrouter.route("/invoice").post(xenditInvoiceWebhook);
webHookrouter.route("/payment-request").post(xenditPaymentRequestWebhook);

export default webHookrouter;
