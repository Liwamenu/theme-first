

## Problem
`tableNumber` is typed as `number` everywhere (types, store, API calls, modals), but in reality table identifiers can be text strings (e.g., "A1", "VIP-3", "Terrace"). This causes `parseInt` to discard non-numeric table IDs, and the QR scanner rejects valid table codes.

## Scope of Change
Change `tableNumber` from `number` to `string` across the entire codebase.

## Files to Modify

### 1. Types — `src/types/restaurant.ts`
- `RestaurantData.tableNumber`: `number` → `string`
- `OrderPayload.tableNumber`: `number` → `string`

### 2. Store — `src/hooks/useRestaurant.ts`
- `setTableNumber` signature: `(tableNumber: number)` → `(tableNumber: string)`
- URL param parsing (lines 72-76): remove `parseInt`, use raw string value directly (just check it's non-empty)

### 3. API — `src/lib/api.ts`
- `apiCallWaiter` payload type: `tableNumber: number` → `tableNumber: string`

### 4. ChangeTableModal — `src/components/menu/ChangeTableModal.tsx` + all theme variants (themes 2-5)
- Props: `onTableChange: (tableNumber: number)` → `(tableNumber: string)`, `currentTable?: number` → `string`
- `extractTableNumber` return type: `number | null` → `string | null`, remove `parseInt` — just return the raw `tableNumber` param value
- `scannedTable` state: `number | null` → `string | null`
- Remove numeric validation (`!isNaN`, `> 0`)

### 5. CheckoutModal — `src/components/menu/CheckoutModal.tsx` + theme variants
- `handleTableChange` parameter: `number` → `string`
- Any numeric checks on `tableNumber` → truthy string checks

### 6. MenuPage files (base + themes 2-5)
- `handleTableSelected` callback parameter: `number` → `string`

### 7. Dummy data — `src/data/restaurant.ts`
- If `tableNumber` is set there, change from number to string (e.g., `"1"` instead of `1`)

### Summary
This is a type-widening refactor: `number` → `string` for `tableNumber` in ~15-20 files. No logic changes beyond removing `parseInt` calls and numeric validations. The QR scanner will accept any non-empty `tableNumber` query param value.

