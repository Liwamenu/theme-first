import { Country, getCountryCallingCode } from "react-phone-number-input";

export function getE164Prefix(country?: Country) {
  if (!country) return "";
  return `+${getCountryCallingCode(country)}`;
}

/**
 * Limits the digits AFTER the country calling code.
 * Example (TR): +90 5xx xxx xx xx -> keeps +90 and max 10 digits after it.
 * Works correctly for all country code lengths (1, 2, 3 digits).
 */
export function limitPhoneAfterCallingCode(
  value: string | undefined,
  country: Country | undefined,
  maxDigitsAfterCode = 10,
) {
  const prefix = getE164Prefix(country);
  if (!prefix) return value;

  // Normalize: keep only digits and '+' (single leading plus)
  const normalized = (value ?? "").replace(/(?!^)\+/g, "").replace(/[^\d+]/g, "");
  const digitsOnly = normalized.replace(/\D/g, "");

  const callingCodeDigits = prefix.replace(/\D/g, "");
  const codeLen = callingCodeDigits.length;

  // Extract digits after the country code
  let restDigits = "";
  
  if (digitsOnly.startsWith(callingCodeDigits)) {
    // Value starts with the correct country code
    restDigits = digitsOnly.slice(codeLen);
  } else if (digitsOnly.length > codeLen) {
    // Value doesn't start with country code but has enough digits
    // This handles cases where country changed but old digits remain
    // Only keep digits if they look like a phone number (not just a country code)
    restDigits = "";
  }
  // If digitsOnly.length <= codeLen and doesn't match, restDigits stays empty

  return `+${callingCodeDigits}${restDigits.slice(0, maxDigitsAfterCode)}`;
}
