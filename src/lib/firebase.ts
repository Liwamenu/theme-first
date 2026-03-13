import { initializeApp, type FirebaseApp } from "firebase/app";
import {
  getMessaging,
  getToken,
  isSupported,
  onMessage,
  type Messaging,
} from "firebase/messaging";

const firebaseConfig = {
  apiKey: "AIzaSyCdz-noqvisJwszkQdrmA8LXLJ_FFE2jdY",
  authDomain: "liwamenu-dca55.firebaseapp.com",
  projectId: "liwamenu-dca55",
  storageBucket: "liwamenu-dca55.firebasestorage.app",
  messagingSenderId: "155320793490",
  appId: "1:155320793490:web:2d375db48cd7dee2dca94b",
};

const VAPID_KEY =
  "BI1qJ_oVpoZqvE10b1_8dd8mvdhbroqajMieGj71CXZrGiyKw5e1SNqnDNMK1nuKnKzFAlwvSUO2-xJ4akOQUyU";

let app: FirebaseApp | null = null;
let messaging: Messaging | null = null;

export async function initFirebaseMessaging(): Promise<{
  supported: boolean;
  token: string | null;
}> {
  const supported = await isSupported();
  if (!supported) return { supported: false, token: null };

  if (!app) app = initializeApp(firebaseConfig);
  if (!messaging) messaging = getMessaging(app);

  await navigator.serviceWorker.register("/firebase-messaging-sw.js");

  const permission = await Notification.requestPermission();
  if (permission !== "granted") {
    return { supported: true, token: null };
  }

  const token = await getToken(messaging, { vapidKey: VAPID_KEY });
  return { supported: true, token };
}

export function subscribeForegroundMessages(
  onPayload: (payload: any) => void
): () => void {
  if (!messaging) return () => {};
  return onMessage(messaging, onPayload);
}
