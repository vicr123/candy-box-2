import path from "node:path";
import * as process from "node:process";
import {stat} from "fs/promises"

export async function findExecutable(executable: string): Promise<string | null> {
    const envPath = process.env.PATH;
    const envExt = process.env.PATHEXT || "";
    const pathDirs = envPath
        .replace(/"+/g, "")
        .split(path.delimiter)
        .filter(Boolean);
    const extensions = envExt.split(";");
    const candidates = pathDirs.flatMap((d) =>
        extensions.map((ext) => path.join(d, executable + ext))
    );
    try {
        return await Promise.any(candidates.map(async (filePath) => {
            if ((await stat(filePath)).isFile()) {
                return filePath;
            }
            throw new Error("Not a file");
        }));
    } catch (e) {
        return null;
    }
}