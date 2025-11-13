// @ts-check

import { siteData } from '../../index.11tydata.js';

const { stories, elements } = siteData;
const examples = stories;

/**
 * Shortcode for generating installation instructions for a component
 * Returns TypeScript import statement and example HTML usage
 * @param {string} tag - The component tag name
 * @returns {Promise<string>} HTML string containing installation instructions
 */
export async function installShortcode(tag) {
  const element = elements.find(d => d.name === tag);
  return element?.manifest?.metadata?.entrypoint
    ? /* html */ `
\`\`\`typescript
import '${element?.manifest?.metadata?.entrypoint}/define.js';
\`\`\`

\`\`\`html
${examples.find(s => s.id === 'Default' && s.element === tag)?.template}
\`\`\`
`
    : '';
}

export async function doDontShortcode(content) {
  return /* html */ `
<div nve-layout="column gap:sm">
  <style scoped>
    .content > div, {
      justify-content: space-between;
      height: 100%;
    }
    .content > pre {
      width: 100%;
      display: block;
      margin: 0;
    }
  </style>
  <div nve-layout="grid gap:sm span-items:6">
    <nve-badge status="success">Do</nve-badge>
    <nve-badge status="danger">Don't</nve-badge>
  </div>
  <div class="content" nve-layout="grid gap:sm span-items:6">
    ${content}
  </div>
</div>`;
}

export async function splitShortcode(content) {
  return /* html */ `
<div class="split-shortcode" nve-layout="grid gap:lg span-items:12 &xl|span-items:6">
  ${content}
</div>`;
}
