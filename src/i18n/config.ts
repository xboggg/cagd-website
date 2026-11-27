import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import en from "./en.json";
import tw from "./tw.json";

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      tw: { translation: tw },
    },
    fallbackLng: "en",
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ["localStorage", "navigator"],
      caches: ["localStorage"],
      lookupLocalStorage: "cagd-lang",
    },
  });

/* Keep <html lang="..."> in step with the chosen language.
   It was hard-coded to "en" in index.html, so a visitor reading the site in
   Twi still had a page that announced itself as English. Screen readers pick
   their pronunciation from this attribute, and search engines read it too. */
function syncHtmlLang(lng?: string) {
  if (typeof document === "undefined") return;
  document.documentElement.lang = (lng || i18n.language || "en").split("-")[0];
}

syncHtmlLang();
i18n.on("languageChanged", syncHtmlLang);

export default i18n;
