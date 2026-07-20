import fs from 'fs';
import path from 'path';
import { cli } from '@custom-elements-manifest/analyzer/cli.js';
import { generateVsCodeCustomElementData } from 'custom-element-vs-code-integration';

const resolve = rel => path.join(process.cwd(), rel);

function normalizeURL(value) {
  if (typeof value !== 'string') {
    return null;
  }

  try {
    const url = new URL(value);
    return url.protocol === 'https:' ? url.href : null;
  } catch {
    return null;
  }
}

const referenceNameByMetadataName = {
  aria: 'WAI-ARIA Reference',
  documentation: 'Documentation'
};

function generateVsCodeCustomElementDataReference(manifestMetadataName, manifestMetadataValue) {
  const name = referenceNameByMetadataName[manifestMetadataName];
  const url = normalizeURL(manifestMetadataValue);

  return name && url ? { name, url } : null;
}

/**
 * Generates a Custom Elements Manifest on initial build
 */
export function cem() {
  return {
    name: 'cem',
    apply: 'build',
    async buildEnd() {
      if (process.env.VITE_INITIAL_BUILD) {
        const hasConfig = fs.existsSync(resolve('./custom-elements-manifest.config.mjs'));
        const configPath = hasConfig
          ? resolve('./custom-elements-manifest.config.mjs')
          : new URL('cem.config.mjs', import.meta.url).toString().replace('file://', '');

        const manifest = await cli({ argv: ['analyze', '--config', configPath, '--outdir', './dist'] });
        const hasComponents = manifest.modules.flatMap(module => module.declarations).find(d => d.tagName);

        if (hasComponents) {
          // deep clone
          const vsCodeManifest = structuredClone(manifest);
          vsCodeManifest.modules.forEach(module => {
            module.declarations
              .filter(declaration => declaration.tagName)
              .forEach(declaration => {
                declaration.attributes = (declaration.attributes ?? []).filter(attr => !attr.deprecated);
              });
          });

          generateVsCodeCustomElementData(vsCodeManifest, {
            outdir: resolve('./dist'),
            htmlFileName: 'data.html.json',
            cssFileName: null,
            referencesTemplate: (_name, tag) => {
              const declaration = vsCodeManifest.modules
                .flatMap(module => module.declarations)
                .find(d => d.tagName === tag);
              return Object.entries(declaration?.metadata ?? {}).flatMap(([name, value]) => {
                const reference = generateVsCodeCustomElementDataReference(name, value);
                return reference ? [reference] : [];
              });
            }
          });
        }
      }
    }
  };
}
