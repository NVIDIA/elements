import { readFileSync, writeFileSync } from 'node:fs';

// This script inlines the current repo workspace version into the index.html path.
// Production apps can simply hard code the version in the HTML.
const packageFile = JSON.parse(readFileSync(new URL('../../elements/package.json', import.meta.url)));
const indexFile = readFileSync('./dist/angular-app/index.html', 'utf8').replaceAll('0.0.0', packageFile.version);
writeFileSync('./dist/angular-app/index.html', indexFile);
