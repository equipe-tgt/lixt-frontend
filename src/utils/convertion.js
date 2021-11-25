import { getI18n } from 'react-i18next';

export const convertDecimalBasedOnLanguage = (number) => {
  if (!number) return;
  if (typeof number === "string") {
    if (isNaN(Number(number))) {
      if (number.includes(',')) {
        number = Number(number.replace(',', '.'))
      }
    }
  }
  if (typeof number !== "number") {
    if (isNaN(Number(number))) return;
    number = Number(number)
  }

  const language = getI18n().language;

  if (language === "pt_BR") {
    return new Intl.NumberFormat("pt-BR", { style: 'currency', currency: 'BRL' }).format(number.toFixed(2))
  } else if (language === "en_US") {
    return new Intl.NumberFormat("en-US", { style: 'currency', currency: 'USD' }).format(number.toFixed(2))
  }
  return number;
}