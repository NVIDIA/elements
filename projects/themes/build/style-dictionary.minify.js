import { globSync } from 'glob';
import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { resolve } from 'path';
import postcss from 'postcss';
import cssnano from 'cssnano';

const themes = globSync(`dist/*.css`);

for (const theme of themes) {
  const css = readFileSync(theme).toString();
  const result = await postcss([cssnano]).process(css, { from: theme, to: theme.replace('.css', '.min.css') });
  writeFileSync(theme, result.css);
}

// Core themes only. Product specific themes should not be bundled!
const bundle = [
  '../dist/index.css',
  '../dist/dark.css',
  '../dist/compact.css',
  '../dist/high-contrast.css',
  '../dist/reduced-motion.css',
  '../dist/debug.css'
]
  .map(path => {
    const css = readFileSync(resolve(import.meta.dirname, path)).toString();
    return css;
  })
  .join('\n');

mkdirSync('dist/bundles', { recursive: true });
writeFileSync(resolve(import.meta.dirname, '../dist/bundles/index.css'), bundle);
