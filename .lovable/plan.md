

## Plan: Always send push fields in order payload

**File:** `src/components/menu/CheckoutModal.tsx` (lines 262-266)

Replace the conditional spread with always-present fields and a console.warn when token is missing:

```typescript
// Before
const pushToken = useFirebaseMessagingStore.getState().pushToken;
const payloadWithPush = {
  ...orderPayload,
  ...(pushToken ? { customerPushToken: pushToken, customerDeviceType: "web" } : {}),
};

// After
const pushToken = useFirebaseMessagingStore.getState().pushToken;
if (!pushToken) {
  console.warn("[Order] No push token available — customerPushToken will be null");
}
const payloadWithPush = {
  ...orderPayload,
  customerPushToken: pushToken,
  customerDeviceType: "web",
};
```

Single file, ~3 lines changed.

