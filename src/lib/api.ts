// Toggle: set to true to use dummy data from src/data/restaurant.ts, false to fetch from API
export const USE_DUMMY_DATA = true;

// API Configuration - Change these URLs as needed
export const API_URLS = {
  reservations: "https://api.liwamenu.com/SetReservations",
  sendReservationCodeSMS: "https://api.liwamenu.com/SendReservationCodeSMS",
  sendReservationCodeEmail: "https://api.liwamenu.com/SendReservationCodeEmail",
  orders: "https://api.liwamenu.com/SendOrders",
  callWaiter: "https://api.liwamenu.com/CallWaiter",
  sendSurvey: "https://api.liwamenu.com/SendSurvey",
  getRestaurantFull: "https://api.liwamenu.com/api/Restaurants/GetRestaurantFullByTenant",
} as const;

// Resolve tenant from URL
export function getTenant(): string {
  const hostname = window.location.hostname;

  // Local development → default tenant
  if (hostname === "localhost" || hostname === "127.0.0.1") {
    return "addis";
  }

  // Subdomain-based: addis.liwamenu.com → "addis"
  const parts = hostname.split(".");
  if (parts.length > 2) {
    return parts[0];
  }

  // Path-based: liwamenu.com/addis → "addis"
  const pathSegment = window.location.pathname.split("/")[1];
  if (pathSegment) {
    return pathSegment;
  }

  return "addis"; // fallback
}

// Helper to check if phone is Turkish based on the phone number
export const isTurkishPhone = (phoneNumber: string): boolean => {
  return phoneNumber?.startsWith("+90");
};
