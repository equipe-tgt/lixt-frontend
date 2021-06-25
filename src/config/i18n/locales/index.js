import i18n from "i18n-js";
import * as Localization from "expo-localization";
import enUS from "./enUS";
import ptBR from "./ptBR";

// Pega os valores capturados pelo expo-localization e normaliza para os nomes
// das traduções que o i18n oferece
const normalizeTranslate = {
  pt: "pt-BR",
  "pt-BR": "pt-BR",
  en: "en-US",
  "en-US": "en-US",
};

// Configurando traduções
i18n.translations = {
  en: enUS,
  pt: ptBR,
};
i18n.fallbacks = true;
i18n.defaultLocale = "en";
i18n.locale = normalizeTranslate[Localization.locale];

// Função de tradução
export function t(key) {
  return i18n.t(key);
}
