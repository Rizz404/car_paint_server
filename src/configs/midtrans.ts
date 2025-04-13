import { Snap, CoreApi } from "midtrans-client";
import env from "./environment";

// Inisialisasi Snap untuk pembayaran frontend
export const midtransSnap = new Snap({
  isProduction: env.NODE_ENV === "production",
  serverKey: env.SANDBOX_MIDTRANS_SERVER_KEY,
  clientKey: env.SANDBOX_MIDTRANS_CLIENT_KEY,
});

// Inisialisasi CoreApi untuk backend processing
export const midtransCoreApi = new CoreApi({
  isProduction: env.NODE_ENV === "production",
  serverKey: env.SANDBOX_MIDTRANS_SERVER_KEY,
  clientKey: env.SANDBOX_MIDTRANS_CLIENT_KEY,
});
