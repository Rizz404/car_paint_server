import {
  Xendit,
  Invoice as InvoiceClient,
  PaymentMethod as PaymentMethodClient,
  Refund as RefundClient,
  PaymentRequest as PaymentRequestClient,
  Customer as CustomerClient,
} from "xendit-node";
import env from "./environment";

const secretKey = env.XENDIT_SECRET_KEY as string;

export const xenditClient = new Xendit({
  secretKey,
});

export const xenditInvoiceClient = new InvoiceClient({
  secretKey,
});

export const xenditPaymentMethodClient = new PaymentMethodClient({ secretKey });

export const xenditRefundClient = new RefundClient({ secretKey });

export const xenditPaymentRequestClient = new PaymentRequestClient({
  secretKey,
});

export const xenditCustomerClient = new CustomerClient({
  secretKey,
});
