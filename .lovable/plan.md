

## Plan: Add debug logging to Firebase init and test on published URL

### Problem
The preview iframe blocks notification permissions, so `getToken()` never executes. There's also zero logging to diagnose failures on the published URL.

### Changes

**File: `src/lib/firebase.ts`** — Add `console.log` at each step so you can see exactly where it stops:

```typescript
export async function initFirebaseMessaging() {
  console.log("[FCM] Starting init...");
  
  const supported = await isSupported();
  console.log("[FCM] isSupported:", supported);
  if (!supported) return { supported: false, token: null };

  if (!app) app = initializeApp(firebaseConfig);
  if (!messaging) messaging = getMessaging(app);

  // SW registration
  try {
    await navigator.serviceWorker.register("/firebase-messaging-sw.js");
    console.log("[FCM] Service worker registered");
  } catch (err) {
    console.error("[FCM] SW registration failed:", err);
  }

  const permission = await Notification.requestPermission();
  console.log("[FCM] Permission result:", permission);
  if (permission !== "granted") {
    return { supported: true, token: null };
  }

  const token = await getToken(messaging, { vapidKey: VAPID_KEY });
  console.log("[FCM] Token received:", token ? token.substring(0, 20) + "..." : "null");
  return { supported: true, token };
}
```

This is a single file change. Once deployed to the published URL, open the browser console there to see exactly which step fails. The preview will likely show `isSupported: false` or permission denied — that's expected in an iframe.

