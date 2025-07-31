import fs from 'fs';
import path from 'path';
import postcss from 'postcss';
import postcssrc from 'postcss-load-config';

const resolve = rel => path.join(process.cwd(), rel);

await generateGlobalAttributes(
  [resolve('./src/layout.css'), resolve('./src/typography.css')],
  ['nve-layout', 'nve-text']
);

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
    let description = '';

    if (attribute === 'nve-layout') {
      description = 'Layout utility for native HTML elements';
    } else if (attribute === 'nve-text') {
      description = 'Typography style utility for native HTML elements';
    }

    globalAttributes.push({
      name: attribute,
      description,
      values: values.map(value => ({
        name: value
      }))
    });
  }

  fs.writeFileSync(
    resolve('./dist/data.html.json'),
    JSON.stringify(
      {
        $schema:
          'https://raw.githubusercontent.com/microsoft/vscode-html-languageservice/main/docs/customData.schema.json',
        version: 1.1,
        globalAttributes
      },
      null,
      2
    )
  );
}
