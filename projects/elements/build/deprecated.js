import { cpSync, readFileSync, writeFileSync } from 'fs';

/**
 * @deprecated
 * pre 1.0 backwards compatible support
 */
cpSync('../themes/dist/fonts/inter.css', './dist/inter.css');
cpSync('../themes/dist/fonts/inter.woff2', './dist/inter.woff2');

// elements.html-data.json
const globalHTMLLegacy = JSON.parse(readFileSync('./dist/data.html.json', 'utf-8').replaceAll('nve-', 'mlv-'));
const globalAttrLegacy = JSON.parse(readFileSync('../styles/dist/data.html.json', 'utf-8').replaceAll('nve-', 'mlv-'));
writeFileSync('./dist/elements.html-data.json', JSON.stringify({ ...globalHTMLLegacy, ...globalAttrLegacy }, null, 2));

// elements.css-vars.json
const cssVarLegacy = readFileSync('../themes/dist/data.css-vars.json', 'utf-8').replaceAll('--nve', '--mlv');
writeFileSync('./dist/elements.css-vars.json', cssVarLegacy);
