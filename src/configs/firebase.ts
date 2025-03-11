import admin from "firebase-admin";
import env from "./environment";

if (!admin.app.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      clientEmail: env.FIREBASE_CLIENT_EMAIL,
      projectId: env.FIREBASE_PROJECT_ID,
      privateKey: env.FIREBASE_PRIVATE_KEY,
    }),
  });
}

const messaging = admin.messaging();

export { admin, messaging };
