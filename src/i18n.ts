import i18next from "i18next";
import i18nextHttp from "i18next-http-backend";
import {sanitiseText} from "./utils";

await i18next
    .use(i18nextHttp)
    .init({
        lng: "en",
        backend: {
            loadPath: "translations/{{lng}}/{{ns}}.json"
        },
        fallbackLng: false,
        returnEmptyString: true,
        missingKeyNoValueFallbackToKey: true,
        parseMissingKeyHandler(key: string, defaultValue?: string): any {
            return "";
        },
        interpolation: {
            escape: (str) => sanitiseText(str)
        }
    })

await i18next.loadLanguages("en");

export const i18n = i18next;