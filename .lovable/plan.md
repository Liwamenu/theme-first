

## Problem
After placing an order, the Order Receipt page is unscrollable because `overflow: hidden` remains on the `<body>` element. The style is applied by multiple sources (the `useBodyScrollLock` hook in themes 2/3, and individual modals like CartDrawer, ProductDetailModal, CallWaiterModal, etc.). When the view switches to "order", these modals either unmount or stop rendering (via the early return), but their cleanup may not run correctly due to React batching, AnimatePresence delays, or the `showSoundPermission` state being set via a `setTimeout` that fires after the view has already switched.

## Root Cause
Multiple competing `document.body.style.overflow = 'hidden'` setters across the app. When transitioning to the order receipt view, the cleanup of these styles is unreliable because:
1. State updates are batched, and the early return for the "order" view prevents some modal components from rendering (and thus cleaning up)
2. In themes 2/3, `showSoundPermission` can be set to `true` via a 1-second delay after order placement, keeping `isAnyOverlayOpen` true even though the SoundPermissionModal isn't rendered in the "order" view

## Fix

**Explicit cleanup in `handleOrderComplete` across all MenuPage files** -- force-clear body styles when transitioning to the order receipt view, regardless of what set them:

```tsx
const handleOrderComplete = useCallback((order: Order, orderType: "inPerson" | "online") => {
  setIsCheckoutOpen(false);
  setViewingOrder(order);
  setCurrentView("order");
  // Force-clear any stuck body scroll locks
  document.body.style.overflow = "";
  document.body.style.paddingRight = "";
  window.scrollTo(0, 0);
}, []);
```

Same cleanup in `handleBackToMenu`:
```tsx
const handleBackToMenu = useCallback(() => {
  setCurrentView("menu");
  setViewingOrder(null);
  document.body.style.overflow = "";
  document.body.style.paddingRight = "";
  window.scrollTo(0, 0);
}, []);
```

And in `handleViewOrder`:
```tsx
const handleViewOrder = useCallback((order: Order) => {
  setViewingOrder(order);
  setCurrentView("order");
  document.body.style.overflow = "";
  document.body.style.paddingRight = "";
  window.scrollTo(0, 0);
}, []);
```

### Files to modify
1. `src/components/menu/MenuPage.tsx` -- base theme
2. `src/themes/theme-2/MenuPage.tsx`
3. `src/themes/theme-3/MenuPage.tsx`
4. `src/themes/theme-4/MenuPage.tsx`
5. `src/themes/theme-5/MenuPage.tsx`

All five files get the same three-line addition (`document.body.style.overflow = ""`, `document.body.style.paddingRight = ""`, `window.scrollTo(0, 0)`) in `handleOrderComplete`, `handleBackToMenu`, and `handleViewOrder`.

