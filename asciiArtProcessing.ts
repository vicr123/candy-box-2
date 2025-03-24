import {Plugin} from "vite";
import fs from "node:fs/promises"
import path from "node:path";

export async function asciiArtProcessing(): Promise<Plugin> {
    const virtualModuleId = "virtual:ascii-art";
    const resolvedVirtualModuleId = '\0' + virtualModuleId;

    const asciiArtDirectory = path.resolve("./ascii");
    const artFiles = await fs.readdir(asciiArtDirectory, {
        recursive: true
    })

    const artObjects = (await Promise.all(artFiles.map(async (file) => {
        const artObject = path.resolve("./ascii", file);
        const stat = await fs.stat(artObject);
        if (!stat.isFile()) {
            return null;
        }

        const artFile = await fs.readFile(artObject, "utf8");
        const artLines = artFile.trimEnd().split(/\r?\n/g).filter((line) => !line.startsWith("@author"));
        const height = artLines.length;
        const width = artLines.reduce((max: number, current: string) => Math.max(max, current.length), 0);

        return {
            name: path.join(path.dirname(file), path.basename(file, ".txt")),
            height,
            width,
            art: artLines
        }
    }))).filter(x => !!x);

    return {
        name: "ascii-art-processing",
        resolveId(id) {
            if (id === virtualModuleId) {
                return resolvedVirtualModuleId;
            }
        },
        load(id) {
            if (id === resolvedVirtualModuleId) {
                return `export const AsciiArt = ${JSON.stringify(artObjects)}`
            }
        }
    }
}