import { readFileSync, writeFileSync } from 'node:fs';
import { Generator } from '@jspm/generator';

const index = process.argv.findIndex((i) => i === '--outDir') + 1;
const dist = (p = '') => `${index ? process.argv[index] : './dist'}/${p}`;
const packageFile = JSON.parse(readFileSync(new URL('../package.json', import.meta.url)));
const CDN_URL = 'https://esm.nvidia.com';

const generator = new Generator({
  defaultProvider: 'esm.sh'
});

// generate main entry point
await generator.install({ alias: '@elements/elements', target: './package.json' });

// swap out for custom esm provider
const generated = JSON.parse(
  JSON.stringify(generator.getMap(), null, 2)
    .replaceAll('https://esm.sh', CDN_URL)
    .replaceAll(`${CDN_URL}/*`, `${CDN_URL}/`)
    .replaceAll('decorators/property.js', 'decorators/')
);

const importmap = {
  // packages likely to be used by consumer
  imports: {
    '@elements/elements': `${CDN_URL}/${packageFile.name}@${packageFile.version}`,
    '@elements/elements/': `${CDN_URL}/${packageFile.name}@${packageFile.version}/`,
    lit: generated.scopes['https://esm.nvidia.com/']['lit/'],
    'lit/': generated.scopes['https://esm.nvidia.com/']['lit/']
  },
  // packages used by the library itself
  scopes: {
    [`${CDN_URL}/`]: {
      ...generated.scopes['./'],
      ...generated.scopes['https://esm.nvidia.com/']
    }
  }
};

writeFileSync(dist('importmap.cdn.json'), JSON.stringify(importmap, null, 2));
