import { Snap, CoreApi } from "midtrans-client";
import env from "./environment";

// Todo: Nanti diganti lagi
// For using sandbox in both development and production
const USE_SANDBOX = false; // Set this to false when ready for real production

// Inisialisasi Snap untuk pembayaran frontend
export const midtransSnap = new Snap({
  isProduction: !USE_SANDBOX, // This controls which Midtrans servers to use
  serverKey: USE_SANDBOX
    ? env.SANDBOX_MIDTRANS_SERVER_KEY
    : env.MIDTRANS_SERVER_KEY,
  clientKey: USE_SANDBOX
    ? env.SANDBOX_MIDTRANS_CLIENT_KEY
    : env.MIDTRANS_CLIENT_KEY,
});

// Inisialisasi CoreApi untuk backend processing
export const midtransCoreApi = new CoreApi({
  isProduction: !USE_SANDBOX, // This controls which Midtrans servers to use
  serverKey: USE_SANDBOX
    ? env.SANDBOX_MIDTRANS_SERVER_KEY
    : env.MIDTRANS_SERVER_KEY,
  clientKey: USE_SANDBOX
    ? env.SANDBOX_MIDTRANS_CLIENT_KEY
    : env.MIDTRANS_CLIENT_KEY,
});
