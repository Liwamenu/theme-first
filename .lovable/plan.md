# Integrate Theme 2 from Thema-2 Project

## Overview

Copy the UI components from the [Thema-2](/projects/c703e5b3-4774-4847-bb55-d20147e4bf2c) project into this project as `theme-2`, leveraging the existing multi-theme architecture. Theme 2 features a candy/purple color scheme with Quicksand + Poppins fonts, horizontal product cards, a scrolling marquee banner, and rounded UI elements.

## Key Differences Between Theme 1 and Theme 2

- **Colors**: Warm amber/orange (theme-1) vs violet purple/cyan candy (theme-2)
- **Fonts**: Kumbh Sans vs Quicksand + Poppins
- **Product cards**: Vertical cards (theme-1) vs horizontal row layout with cart button (theme-2)
- **Header**: Different hero layout with scrolling marquee slogan in theme-2
- **Styling**: More rounded corners, candy-like shadows, float animation

## Important Note

The Thema-2 project has **outdated API logic** in its ReservationModal (still uses simulated API calls). The theme-2 components will be updated to use the current project's API integration (`createReservation`, `verifyReservation`, backend error messages in TR/EN).

## Plan

### 1. Create theme-2 component directory and copy all UI components

Create `src/themes/theme-2/` with its own copies of all menu components, adapted to import from their local directory:

- `src/themes/theme-2/index.tsx` (entry point exporting MenuPage)
- `src/themes/theme-2/MenuPage.tsx`
- `src/themes/theme-2/RestaurantHeader.tsx`
- `src/themes/theme-2/ProductCard.tsx`
- `src/themes/theme-2/CategoryTabs.tsx`
- `src/themes/theme-2/CartDrawer.tsx`
- `src/themes/theme-2/ProductDetailModal.tsx`
- `src/themes/theme-2/CheckoutModal.tsx`
- `src/themes/theme-2/OrderReceipt.tsx`
- `src/themes/theme-2/Footer.tsx`
- `src/themes/theme-2/CallWaiterModal.tsx`
- `src/themes/theme-2/ReservationModal.tsx` (using current project's API integration)
- `src/themes/theme-2/SurveyModal.tsx`
- `src/themes/theme-2/AnnouncementModal.tsx`
- `src/themes/theme-2/ChangeTableModal.tsx`
- `src/themes/theme-2/WaiterSuccessAnimation.tsx`
- `src/themes/theme-2/FlyingEmoji.tsx`
- `src/themes/theme-2/SoundPermissionModal.tsx`
- `src/themes/theme-2/LanguageSwitcher.tsx`
- `src/themes/theme-2/ThemeSwitcher.tsx`

All components will import shared hooks (`useCart`, `useOrder`, `useRestaurant`, `useFlyingEmoji`), types, and utilities from the existing shared paths (`@/hooks/`, `@/types/`, `@/lib/`).

### 2. Create theme-2 specific CSS

Create `src/themes/theme-2/theme.css` containing the candy purple/cyan color variables, Quicksand + Poppins font imports, and theme-specific utilities (`.candy-border`, `.animate-float`, glass overrides). This CSS will be imported in the theme-2 entry point and will scope the theme styles using a CSS class wrapper (e.g., `.theme-2`) to avoid conflicting with theme-1's global styles.

### 3. Update ReservationModal for theme-2

Copy the current project's ReservationModal API logic (using `createReservation`, `apiVerifyReservation`, `getResponseData`, `reservationId` state, backend error messages with TR/EN support) into theme-2's ReservationModal while keeping theme-2's visual styling.

### 4. Register theme-2 in ThemeRouter

Update `src/themes/ThemeRouter.tsx` to add theme-2 to the registry:

```
const themeComponents = {
  1: lazy(() => import("./theme-1")),
  2: lazy(() => import("./theme-2")),
};
```

### Technical Details

- **CSS isolation**: Theme-2's unique color palette and font will be applied via a wrapper `<div className="theme-2">` with scoped CSS variables, so they only apply when theme-2 is active
- **Shared code**: All hooks, types, API utilities, i18n translations, and phone validation remain shared -- only UI components are duplicated
- **Component imports**: Theme-2 components import each other locally (`./ProductCard`) and shared code from `@/` paths
- **ReservationModal**: Will use the real API endpoints (`/api/Reservations/Create`, `/api/Reservations/Verify`) with proper error handling, not the simulated calls from Thema-2

the RestaurantData will save the theme ids starting from 0, so theme1 will be 0, theme2 is 1 and so on.