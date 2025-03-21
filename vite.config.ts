import {defineConfig} from "vite";
import {commitsSinceLastTag, lastTag, versioningString} from "./versioning";

const upstreamBaseVersion = "1.2.3";

export default defineConfig({
    esbuild: {
        supported: {
            "top-level-await": true
        }
    },
    base: "./",
    define: {
        __LAST_TAG: JSON.stringify(lastTag),
        __COMMITS_SINCE_LAST_TAG: JSON.stringify(commitsSinceLastTag),
        __VERSION: JSON.stringify(versioningString),
        __VERSIONSTRING: JSON.stringify(`${versioningString} AP (base ${upstreamBaseVersion})`)
    }
})
