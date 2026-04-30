// @ts-check

import { siteData } from '../../index.11tydata.js';

const { examples, elements } = siteData;

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
<section nve-layout="column gap:sm">

\`\`\`html
<script type="module">
  import '${element?.manifest?.metadata?.entrypoint}/define.js';
</script>

${examples.find(s => s.name === 'Default' && s.element === tag)?.template}
\`\`\`

<div nve-layout="column gap:xs" role="region" aria-label="AI Agent API access via CLI or MCP">

  \`\`\`shell
  nve api.get ${element.name}
  \`\`\`

  <div nve-layout="row gap:xxs">
    <a href="docs/cli/" nve-text="body sm muted">CLI</a>
    <span nve-text="body sm muted">/</span>
    <a href="docs/mcp/" nve-text="body sm muted">MCP</a>
  </div>
</div>

</section>
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

export async function beforeAfterShortcode(content) {
  return /* html */ `
<div nve-layout="column gap:sm">
  <style scoped>
    .content > div, {
      justify-content: space-between;
      height: 100%;
    }
    .content > pre {
      width: 100%;
      display: flex;
      margin: 0;
    }
  </style>
  <div nve-layout="grid gap:sm span-items:6">
    <nve-badge status="danger" container="flat">Before</nve-badge>
    <nve-badge status="success" container="flat">After</nve-badge>
  </div>
  <div class="content" nve-layout="grid gap:sm span-items:6 align:vertical-stretch">
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
