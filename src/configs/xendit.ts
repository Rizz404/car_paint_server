import { Invoice as InvoiceClient, Xendit } from "xendit-node";
import env from "./environment";

const secretKey = env.XENDIT_SECRET_KEY as string;

export const xenditClient = new Xendit({
  secretKey,
});

export const xenditInvoiceClient = new InvoiceClient({
  secretKey,
});
