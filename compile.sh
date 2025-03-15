#!/bin/bash

### Check existing commands

command -v tsc >/dev/null 2>&1 || { echo >&2 "The typescript compiler is not installed"; exit 1; }
command -v yuicompressor >/dev/null 2>&1 || { echo >&2 "Yuicompressor is not installed"; exit 1; }

### Update the version written in the cacheManifest.mf file to force update of the whole game (see https://developer.mozilla.org/en-US/docs/HTML/Using_the_application_cache )

cd pythonScripts
python updateCacheManifestVersion.py
cd ..

### Generate genAscii.ts and genText.ts from the ascii and text files
### They will be added in the code/gen dir

cd pythonScripts
python genAscii.py
python genText.py
cd ..

### Compile the game using tsc
### It will generate the candybox2_uncompressed.js.temp script

tsc ./libs/*.ts ./code/main/*.ts ./code/gen/*.ts ./code/arena/*/*.ts --out ./candybox2_uncompressed.js.temp

## Minify the script with yuicompressor, we get a candybox2.js.temp script

yuicompressor ./candybox2_uncompressed.js.temp --type js --line-break 80 -o candybox2.js.temp

### Create the candybox2.js file from the license and the temp file

cat candybox2_sourceCodeLicense.txt > candybox2.js
cat candybox2.js.temp >> candybox2.js

### Create the candybox2_uncompressed.js file from the license and the temp file

cat candybox2_sourceCodeLicense.txt > candybox2_uncompressed.js
cat candybox2_uncompressed.js.temp >> candybox2_uncompressed.js

### Remove the temp files

rm candybox2.js.temp candybox2_uncompressed.js.temp
