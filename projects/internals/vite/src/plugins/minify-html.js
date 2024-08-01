import { default as minify } from 'rollup-plugin-minify-html-literals';

export const minifyHTML = minify.default ? minify.default : minify;
