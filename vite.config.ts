import {defineConfig} from "vite";
import {versioningString} from "./versioning";

const upstreamBaseVersion = "1.2.3";

export default defineConfig({
    esbuild: {
        supported: {
            "top-level-await": true
        }
    },
    base: "./",
    define: {
        __VERSION: JSON.stringify(`${versioningString} AP (base ${upstreamBaseVersion})`),
    }
})
