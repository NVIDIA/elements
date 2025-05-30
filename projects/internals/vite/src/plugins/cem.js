import fs from 'fs';
import path from 'path';
import { cli } from '@custom-elements-manifest/analyzer/cli.js';
import { generateVsCodeCustomElementData } from 'custom-element-vs-code-integration';

const resolve = rel => path.join(process.cwd(), rel);

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
          generateVsCodeCustomElementData(manifest, {
            outdir: resolve('./dist'),
            htmlFileName: 'data.html.json',
            cssFileName: null,
            referencesTemplate: (_name, tag) => {
              const declaration = manifest.modules.flatMap(module => module.declarations).find(d => d.tagName === tag);
              const references = Object.keys(declaration.metadata)
                .map(name => ({ name, url: declaration.metadata[name] }))
                .filter(ref => ref.url?.includes && ref.url.includes('http'));
              return references;
            }
          });
        }
      }
    }
  };
}
