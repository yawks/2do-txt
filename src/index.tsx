import "@fontsource/inter";
import "./index.css";

import { App } from "@/components/App";
import Backend from "i18next-http-backend";
import LanguageDetector from "i18next-browser-languagedetector";
import { createRoot } from "react-dom/client";
import { formatLocaleDate } from "@/utils/date";
import i18n from "i18next";
import { initReactI18next } from "react-i18next";

i18n
  .use(Backend)
  .use(LanguageDetector)
  .use(initReactI18next) // passes i18n down to react-i18next
  .init({
    backend: {
      loadPath: "/locales/{{lng}}/{{ns}}.json",
    },
    load: "languageOnly",
    fallbackLng: "en",
    supportedLngs: ["en", "de", "fr"],
    interpolation: {
      escapeValue: false,
      format: (value, format, lng) => {
        if (value instanceof Date && format === "date") {
          return formatLocaleDate(value, lng);
        }
        return value;
      },
    },
  });

const container = document.getElementById("root");
const root = createRoot(container!);
root.render(<App />);
