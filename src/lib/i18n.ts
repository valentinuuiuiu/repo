import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Initialize i18next
i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: {
        translation: {
          // English translations
          welcome: 'Welcome to our application',
        },
      },
      es: {
        translation: {
          // Spanish translations
          welcome: 'Bienvenido a nuestra aplicación',
        },
      },
    },
    lng: 'en', // Default language
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false, // React already escapes values
    },
  });

export default i18n;