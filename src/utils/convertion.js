import { getI18n } from 'react-i18next';
import 'intl';
import 'intl/locale-data/jsonp/en';
import 'intl/locale-data/jsonp/en-US';
import 'intl/locale-data/jsonp/pt-BR';

export const convertDecimalBasedOnLanguage = (number) => {
  if (number !== 0 && !number) return;
  if (typeof number === 'string') {
    if (isNaN(Number(number))) {
      if (number.includes(',')) {
        number = Number(number.replace(',', '.'));
      } else {
        return;
      }
    } else {
      number = Number(number);
    }
  }
  if (typeof number !== 'number') {
    if (isNaN(Number(number))) return;
    number = Number(number);
  }

  const language = getI18n().language;

  if (language === 'pt_BR') {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(number);
  } else if (language === 'en_US') {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(number);
  }
  return number;
};
