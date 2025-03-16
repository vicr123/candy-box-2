import fs from 'fs/promises';
import path from "path";

const base = "text"
const namespace = "translation";

const files = await fs.readdir(base, {
    recursive: false
});

for (const file of files) {
    const stat = await fs.stat(`${base}/${file}`);
    if (!stat.isDirectory()) {
        await fs.mkdir(`public/translations/${path.basename(file, ".txt")}`, {
            recursive: true
        });
        const oldTranslation = await fs.readFile(`${base}/${file}`, {
            encoding: 'utf-8'
        });
        const parts = oldTranslation.split("\n").filter(x => x != "");

        let newTranslationFile = {};
        for (let i = 0; i < parts.length; i+= 2) {
            const key = parts[i];
            const translation = parts[i + 1];

            const trimmedKey = key.trim().substring(3, key.includes(" ") ? key.indexOf(" ") : undefined);
            newTranslationFile[trimmedKey] = translation.trim();
        }

        await fs.writeFile(`public/translations/${path.basename(file, ".txt")}/${namespace}.json`, JSON.stringify(newTranslationFile, null, 4));
    }
}