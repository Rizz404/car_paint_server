import { Invoice as InvoiceClient, Xendit } from "xendit-node";
import env from "./environtment";

const secretKey = env.XENDIT_SECRET_KEY as string;

if (!secretKey) {
  throw new Error("XENDIT_SECRET_KEY is not set in the environment variables.");
}

export const xenditClient = new Xendit({
  secretKey,
});

export const xenditInvoiceClient = new InvoiceClient({
  secretKey,
});
