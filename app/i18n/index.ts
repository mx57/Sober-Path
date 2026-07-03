import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';

import en from './locales/en/translation.json';
import ru from './locales/ru/translation.json';

const resources = {
  en: { translation: en },
  ru: { translation: ru },
};

const getLanguage = (): string => {
  const locale = Localization.getLocales()[0]?.languageCode;
  return locale && resources.hasOwnProperty(locale) ? locale : 'en';
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: getLanguage(),
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
