import i18next from "i18next";
import i18nextHttp from "i18next-http-backend";

await i18next
    .use(i18nextHttp)
    .init({
        lng: "en",
        backend: {
            loadPath: "translations/{{lng}}/{{ns}}.json"
        }
    })

await i18next.loadLanguages("en");

export const i18n = i18next;