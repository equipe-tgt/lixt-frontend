import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { setLanguageApp } from '../../../services/LanguageService';
import ptBr from './ptBR';
import enUs from './enUS';

const resources = {
  pt_BR: {
    translation: ptBr,
  },
  en_US: {
    translation: enUs,
  },
};

const languageDetector = {
  type: 'languageDetector',
  async: true,
  detect: async (callbackLanguage) => {
    const storedLanguage = await AsyncStorage.getItem('language');

    if (storedLanguage) {
      setLanguageApp(storedLanguage);
      return callbackLanguage(storedLanguage);
    }

    return callbackLanguage('pt_BR');
  },
  init: () => {},
  cacheUserLanguage: (language) => {
    AsyncStorage.setItem('language', language);
  },
};

i18n
  .use(languageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'pt_BR',

    keySeparator: false,

    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
