import i18next from "i18next";
import i18nextHttp from "i18next-http-backend";
import {sanitiseText} from "./utils";
import {Algo} from "./main/Algo";

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
            escape: (str) => sanitiseText(str),
            format: (value, format, lng) => {
                if (typeof value === "number") {
                    return Algo.numberToStringButNicely(value);
                }
                return value;
            },
            alwaysFormat: true
        }
    })

await i18next.loadLanguages("en");

export const i18n = i18next;