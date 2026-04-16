

## Change
Treat `announcementSettings.delayMs` value as **seconds** (not milliseconds). The field name stays `delayMs` for backend compatibility, but the value is interpreted as seconds in the frontend.

## File to modify
`src/components/menu/AnnouncementModal.tsx` — in the `setTimeout` call, multiply `delayMs` by 1000 to convert seconds → milliseconds before passing to the timer.

## Change detail
```ts
// Before
setTimeout(() => setOpen(true), settings.delayMs);

// After
setTimeout(() => setOpen(true), settings.delayMs * 1000);
```

That's it — single-line change, no type/schema changes, no backend changes.

