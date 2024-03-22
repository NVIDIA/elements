import { cpSync } from 'fs';

/**
 * @deprecated `@elements/elements/inter.css`
 * 1.0 backwards compatible support for inter fonts which exist at `@nvidia-elements/themes/fonts/inter.css`
 */
cpSync('../themes/dist/fonts/inter.css', './dist/inter.css');
cpSync('../themes/dist/fonts/inter.woff2', './dist/inter.woff2');
