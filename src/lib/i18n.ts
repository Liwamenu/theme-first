import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Import translations
import trTranslation from '@/locales/tr/translation.json';
import enTranslation from '@/locales/en/translation.json';

const resources = {
  tr: { translation: trTranslation },
  en: { translation: enTranslation },
};

// Get initial language from restaurant data (will be updated later)
const getInitialLanguage = (): string => {
  // Default to Turkish, will be synced with restaurant data
  return 'tr';
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: getInitialLanguage(),
    fallbackLng: 'tr',
    interpolation: {
      escapeValue: false,
    },
    react: {
      useSuspense: false,
    },
  });

// Function to change language dynamically
export const changeLanguage = (lang: string) => {
  const normalizedLang = lang.toLowerCase();
  if (normalizedLang === 'en' || normalizedLang === 'english') {
    i18n.changeLanguage('en');
  } else {
    i18n.changeLanguage('tr');
  }
};

export default i18n;
