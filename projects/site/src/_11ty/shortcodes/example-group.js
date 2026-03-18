import { exampleShortcode } from './example.js';
import { siteData } from '../../index.11tydata.js';

const { examples } = siteData;

export async function exampleGroupShortcode(content, ...examplePaths) {
  const exampleList = examplePaths.map(path => {
    const [entrypoint, exampleName] = path.split(':');
    return findExample(entrypoint, exampleName);
  });

  return /* html */ `
<div class="example-group-shortcode" nve-layout="grid gap:lg span-items:12 &xl|span-items:6">
  <div nve-layout="column gap:lg">
  ${(
    await Promise.all(
      exampleList.map(async example => {
        return await exampleShortcode(example.entrypoint, example.name, { summary: false });
      })
    )
  ).join('')}
  </div>
  <div nve-layout="column gap:md">
    <p nve-text="body">${content}</p>
    ${
      exampleList.some(i => i.summary || i.description)
        ? /* html */ `
    <nve-grid container="flat">
      <nve-grid-header>
        <nve-grid-column width="100px">Example</nve-grid-column>
        <nve-grid-column>Usage</nve-grid-column>
      </nve-grid-header>
      ${exampleList
        .map(
          example => /* html */ `
        <nve-grid-row>
          <nve-grid-cell>
            ${example.name}
          </nve-grid-cell>
          <nve-grid-cell>
            ${example.summary || example.description}
          </nve-grid-cell>
        </nve-grid-row>
      `
        )
        .join('')}
    </nve-grid>`
        : ''
    }
  </div>
</div>`.replaceAll('\n', '');
}

function findExample(ref, exampleName) {
  const example = examples.find(s => s.entrypoint?.includes(ref) && s.name === exampleName);

  if (!example) {
    throw new Error(`Example not found: ${ref} ${exampleName}`);
  }

  return example;
}
