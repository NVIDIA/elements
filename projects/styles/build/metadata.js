import fs from 'fs';
import path from 'path';
import postcss from 'postcss';
import postcssrc from 'postcss-load-config';

const resolve = rel => path.join(process.cwd(), rel);

// temporary examples to resolve circular dependency in metadata
const layoutExample = `
<section nve-layout="row gap:sm">
  <div></div>
  <div></div>
  <div></div>
</section>
<section nve-layout="column gap:sm">
  <div></div>
  <div></div>
  <div></div>
</section>
<section nve-layout="grid gap:sm span-items:6">
  <div>columns 1-6</div>
  <div>columns 7-12</div>
</section>`;

const typographyExample = `
<div nve-layout="column gap:lg">
  <p nve-text="display">display</p>
  <p nve-text="heading">heading</p>
  <p nve-text="body">body</p>
  <p nve-text="label">label</p>
</div>
<div nve-layout="column gap:lg">
  <h1 nve-text="display">display</h1>
  <h2 nve-text="heading">heading</h2>
  <h3 nve-text="body">body</h3>
  <h4 nve-text="label">label</h4>
</div>`;

await generateGlobalAttributes(
  [
    resolve('./src/layout.css'),
    resolve('./src/typography.css'),
    resolve('./src/labs/layout-container.css'),
    resolve('./src/labs/layout-viewport.css')
  ],
  ['nve-layout', 'nve-text', 'nve-display']
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
    let example = '';

    if (attribute === 'nve-layout') {
      description = 'Layout utility for native HTML elements';
      example = layoutExample;
    } else if (attribute === 'nve-text') {
      description = 'Typography style utility for native HTML elements';
      example = typographyExample;
    } else if (attribute === 'nve-display') {
      description = 'Display utility for native HTML elements';
      example = '';
    }

    globalAttributes.push({
      name: attribute,
      description,
      example,
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
