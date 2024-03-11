import { readFileSync, writeFileSync } from 'node:fs';

const buildPath = 'dist/';

const base = JSON.parse(readFileSync(`${buildPath}index.json`, { encoding: 'utf-8' }));

const css = Object.entries(base)
  .map(([key, value]) => {
    return `  --${key.replace('nve', 'mlv')}: var(--${key});`;
  })
  .join('\n');

const json = Object.entries(base)
  .map(([key, value]) => {
    return `  "${key.replace('nve', 'mlv')}": "${key}"`;
  })
  .join(',\n');

writeFileSync(
  `${buildPath}elements.css`,
  `:root, [nve-theme], [nve-theme] {
${css}

  /* deprecations */
  --nve-sys-interaction-emphasize-background: var(--nve-sys-interaction-emphasis-background);
  --nve-sys-interaction-emphasize-color: var(--nve-sys-interaction-emphasis-color);
  --nve-sys-interaction-secondary-background: var(--nve-sys-accent-secondary-background);
  --nve-sys-interaction-secondary-color: var(--nve-sys-text-white-color);
}`
);

writeFileSync(
  `${buildPath}elements.json`,
  `{
${json}
}`
);
