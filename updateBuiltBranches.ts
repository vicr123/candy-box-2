import * as process from "node:process";
import {headCommit, lastTag, latestCommitIsTag, versioningString} from "./versioning.ts";
import {findExecutable} from "./findExecutable.ts";
import path from "node:path";
import {execFile} from "node:child_process";
import {rm, symlink} from "node:fs/promises"

const vite = await findExecutable("vite");
if (!vite) {
    console.warn("Unable to find Vite")
    process.exit(1);
}

if (process.argv.length != 3) {
    console.warn("Missing argument for path to built tree")
    process.exit(1);
}

const builtTreeFolder = process.argv[2];

const folders = [
    versioningString,
];
if (latestCommitIsTag || true) {
    folders.push("latest");
}
if (!latestCommitIsTag) {
    folders.push(`${lastTag}+`);
}

console.log(`Building client for commit ${headCommit}`)
const buildFolder = path.resolve(builtTreeFolder, headCommit);
const viteResult = execFile(vite, ["build", "--outDir", buildFolder])
viteResult.stdout.pipe(process.stdout)
viteResult.stderr.pipe(process.stderr)

viteResult.on("exit", async (code) => {
    if (code != 0) {
        console.log("Vite build failed, aborting");
        return;
    }
    for (const folder of folders) {
        const destination = path.resolve(builtTreeFolder, folder)
        console.log(`Linking build folder ${destination}`)
        await rm(destination, {
            force: true,
            recursive: true
        });

        await symlink(headCommit, destination);
    }
})
