import { NativeModules, Platform } from 'react-native';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { setLanguageApp } from '../../../services/LanguageService';
import pt_br from './ptBR';
import en_us from './enUS';

const resources = {
  pt_BR: {
    translation: pt_br,
  },
  en_US: {
    translation: en_us,
  },
};

const languageDetector = {
  type: 'languageDetector',
  async: true,
  detect: async (callback) => {
    const storedLanguage = await AsyncStorage.getItem('language');

    if (storedLanguage) {
      setLanguageApp(storedLanguage);
      return callback(storedLanguage);
    }

    return callback('en_US');
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
