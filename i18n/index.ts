import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';
import { getLocales } from 'expo-localization';

import en from './en';
import pl from './pl';

const deviceLocale = getLocales()[0]?.languageCode ?? 'en';

i18next.use(initReactI18next).init({
  lng: deviceLocale,
  fallbackLng: 'en',
  resources: {
    en: { translation: en },
    pl: { translation: pl },
  },
  interpolation: {
    escapeValue: false, // React already escapes values
  },
});

export default i18next;
