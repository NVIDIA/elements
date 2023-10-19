import { readFileSync, writeFileSync } from 'node:fs';
import { Generator } from '@jspm/generator';

const index = process.argv.findIndex((i) => i === '--outDir') + 1;
const dist = (p = '') => `${index ? process.argv[index] : './dist'}/${p}`;
const packageFile = JSON.parse(readFileSync(new URL('../package.json', import.meta.url)));
const CDN_URL = 'https://https://esm.sh';

const generator = new Generator({
  defaultProvider: 'esm.sh'
});

// generate main entry point
await generator.install({ alias: '@elements/elements', target: './package.json' });

// swap out for custom esm provider
const generated = JSON.parse(JSON.stringify(generator.getMap(), null, 2)
  .replaceAll('https://esm.sh', CDN_URL)
  .replaceAll(`${CDN_URL}/*`, `${CDN_URL}/`)
  .replaceAll('decorators/property.js', 'decorators/')
);

const importmap = {
  // packages likely to be used by consumer
  imports: {
    '@elements/elements': `${CDN_URL}/${packageFile.name}@${packageFile.version}`,
    '@elements/elements/': `${CDN_URL}/${packageFile.name}@${packageFile.version}/`,
    'lit': generated.scopes['https://https://esm.sh/']['lit/'],
    'lit/': generated.scopes['https://https://esm.sh/']['lit/']
  },
  // packages used by the library itself
  scopes: {
    [`${CDN_URL}/`]: {
      ...generated.scopes['./'],
      ...generated.scopes['https://https://esm.sh/']
    }
  }
}

writeFileSync(dist('importmap.cdn.json'), JSON.stringify(importmap, null, 2));
