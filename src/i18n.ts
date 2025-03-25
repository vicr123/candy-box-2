import i18next from "i18next";
import {sanitiseText} from "./utils";
import {Algo} from "./main/Algo";

// @ts-ignore
import resources from "virtual:i18next-loader";

await i18next
    .init({
        lng: "en",
        resources: resources,
        backend: {
            loadPath: "translations/{{lng}}/{{ns}}.json"
        },
        fallbackLng: false,
        returnEmptyString: true,
        missingKeyNoValueFallbackToKey: true,
        keySeparator: false,
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

export const i18n = i18next;