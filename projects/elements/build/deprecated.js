import { cpSync } from 'fs';

/**
 * @deprecated
 * pre 1.0 backwards compatible support
 */
cpSync('../themes/dist/fonts/inter.css', './dist/inter.css');
cpSync('../themes/dist/fonts/inter.woff2', './dist/inter.woff2');
cpSync('../themes/dist/data.css-vars.json', './dist/elements.css-vars.json');
cpSync('./dist/data.html.json', './dist/elements.html-data.json');
