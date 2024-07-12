import fs from 'fs';
import path from 'path';
import postcss from 'postcss';
import postcssrc from 'postcss-load-config';
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
    async buildStart() {
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

        /** todo: migrate this to style utils library */
        const { name } = JSON.parse(fs.readFileSync(resolve('./package.json')));
        if (name === '@elements/elements' || name === '@nvidia-elements/core') {
          await generateGlobalAttributes(
            [resolve('./src/css/module.layout.css'), resolve('./src/css/module.typography.css')],
            ['nve-layout', 'nve-text', 'nve-layout', 'nve-text']
          );
        }
      }
    }
  };
}

async function generateGlobalAttributes(files, attributes) {
  const attributeValues = {};
  for (const attribute of attributes) {
    attributeValues[attribute] = new Set();
  }

  const { plugins, options } = await postcssrc({ from: undefined });
  const processor = postcss(plugins);

  for (const file of files) {
    (await processor.process(fs.readFileSync(file, 'utf-8'), options)).root.walkRules(rule => {
      for (let attribute of attributes) {
        const pattern = new RegExp(`\\[${attribute}[~]?=['"]?(.*?)['"]?\\]`, 'g');
        let match;
        while ((match = pattern.exec(rule.selector)) !== null) {
          attributeValues[attribute].add(match[1]);
        }
      }
    });
  }

  const utilityAttributes = Object.fromEntries(
    Object.entries(attributeValues).map(([entry, set]) => [entry, Array.from(set)])
  );
  const globalAttributes = [];
  for (const [attribute, values] of Object.entries(utilityAttributes)) {
    globalAttributes.push({
      name: attribute,
      values: values.map(value => ({
        name: value
      }))
    });
  }

  const data = JSON.parse(fs.readFileSync(resolve('./dist/data.html.json')));
  fs.writeFileSync(
    resolve('./dist/data.html.json'),
    JSON.stringify(
      {
        ...data,
        globalAttributes
      },
      null,
      2
    )
  );
}
