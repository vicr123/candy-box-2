import {promisify} from "node:util";
import {execFile} from "node:child_process";
import {findExecutable} from "./findExecutable.ts";

const git = await findExecutable("git")

const {stdout: lastTagOutput} = await promisify(execFile)(git, ["describe", "--tags", "--abbrev=0"])
export const lastTag = lastTagOutput.trim();

const {stdout: commitsSinceLastTagOutput} = await promisify(execFile)(git, ["rev-list", `${lastTag.trim()}..HEAD`, "--count"])
export const commitsSinceLastTag = commitsSinceLastTagOutput.trim();

const {stdout: headCommitOutput} = await promisify(execFile)(git, ["rev-parse", "HEAD"])
export const headCommit = headCommitOutput.trim();

const mergeBase = promisify(execFile)(git, ["merge-base", "--is-ancestor", "HEAD", "archipelago"]);
try {
    await mergeBase;
} catch {

}
export const isOnArchipelagoBranch = mergeBase.child.exitCode == 0;

export const latestCommitIsTag = commitsSinceLastTag == "0";
export const versioningString = latestCommitIsTag ? lastTag : isOnArchipelagoBranch ? `${lastTag}+${commitsSinceLastTag}` : headCommit