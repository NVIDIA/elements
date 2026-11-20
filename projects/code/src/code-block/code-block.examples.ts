// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import '@nvidia-elements/code/languages/markdown.js';
import '@nvidia-elements/code/languages/typescript.js';
import '@nvidia-elements/code/code-block/define.js';
import '@nvidia-elements/core/copy-button/define.js';
import '@nvidia-elements/core/icon/icons/document.js';
import '@nvidia-elements/core/icon/define.js';
import '@nvidia-elements/core/icon-button/define.js';

export default {
  title: 'Labs/Code/Codeblock',
  component: 'nve-code-block'
};

/**
 * @summary Present syntax-highlighted source with a custom header and footer.
 */
export const Default = {
  render: () => html`
<nve-code-block id="gpu-inventory" language="typescript">
  <nve-code-block-header>
    <nve-icon slot="prefix" name="document" aria-hidden="true"></nve-icon>
    <span nve-text="body">gpu-inventory.ts</span>
    <nve-copy-button slot="suffix" aria-label="Copy source" container="inline" behavior-copy></nve-copy-button>
  </nve-code-block-header>
  <template>
const gpus = [
  { name: 'B200', specs: { architecture: 'Blackwell' } },
  { name: 'H100 SXM5', specs: { architecture: 'Hopper' } }
] as const;&#10;
export const blackwellGpus = gpus.filter(gpu =>
  gpu.specs.architecture.startsWith('Blackwell')
);
  </template>
  <nve-code-block-footer><span nve-text="body">Expected match · B200</span></nve-code-block-footer>
</nve-code-block>
<script type="module">
  const block = document.querySelector('#gpu-inventory');
  const source = block.querySelector('template').content.textContent.trim();
  block.code = source;
  block.querySelector('nve-copy-button').value = source;
</script>
`
};

/**
 * @summary Highlight source across languages, from Markdown and fenced JavaScript to tagged HTML and CSS templates.
 */
export const EmbeddedLanguages = {
  render: () => html`
<nve-code-block language="markdown" style="--white-space: pre-wrap;">
  <template>
# Release notes&#10;
Show the current build status.&#10;
~~~javascript
const status = "Ready";
const badge = html\`&lt;span class="status"&gt;&#36;{status}&lt;/span&gt;\`;
const styles = css\`.status { color: seagreen; }\`;
~~~
  </template>
</nve-code-block>
`
};

/**
 * @summary Fit highlighted source into the surrounding surface.
 */
export const Flat = {
  render: () => html`
<nve-code-block language="typescript" container="flat">
  <template>
const gpus = [
  { name: 'B200', specs: { architecture: 'Blackwell' } },
  { name: 'H100 SXM5', specs: { architecture: 'Hopper' } }
] as const;&#10;
export const blackwellGpus = gpus.filter(gpu =>
  gpu.specs.architecture.startsWith('Blackwell')
);
  </template>
</nve-code-block>
`
};

/**
 * @summary Set the code block’s theme independently of the page.
 */
export const Theme = {
  render: () => html`
<div nve-layout="column gap:md">
  <nve-code-block nve-theme="light" language="typescript">
    <template>
const gpus = [
  { name: 'B200', specs: { architecture: 'Blackwell' } },
  { name: 'H100 SXM5', specs: { architecture: 'Hopper' } }
] as const;&#10;
export const blackwellGpus = gpus.filter(gpu =>
  gpu.specs.architecture.startsWith('Blackwell')
);
    </template>
  </nve-code-block>
  <nve-code-block nve-theme="dark" language="typescript">
    <template>
const gpus = [
  { name: 'B200', specs: { architecture: 'Blackwell' } },
  { name: 'H100 SXM5', specs: { architecture: 'Hopper' } }
] as const;&#10;
export const blackwellGpus = gpus.filter(gpu =>
  gpu.specs.architecture.startsWith('Blackwell')
);
    </template>
  </nve-code-block>
</div>
`
};

/**
 * @summary Let readers copy the source from an overlaid action.
 */
export const Copy = {
  render: () => html`
<nve-code-block id="copy-inventory" language="typescript">
  <nve-copy-button slot="actions" aria-label="Copy source" container="inline" behavior-copy></nve-copy-button>
  <template>
const gpus = [
  { name: 'B200', specs: { architecture: 'Blackwell' } },
  { name: 'H100 SXM5', specs: { architecture: 'Hopper' } }
] as const;&#10;
export const blackwellGpus = gpus.filter(gpu =>
  gpu.specs.architecture.startsWith('Blackwell')
);
  </template>
</nve-code-block>
<script type="module">
  const block = document.querySelector('#copy-inventory');
  block.querySelector('nve-copy-button').value = block.querySelector('template').content.textContent.trim();
</script>
`
};

/**
 * @summary Supply source programmatically through the `code` property.
 */
export const Code = {
  render: () => html`
<nve-code-block language="typescript" id="code-property"></nve-code-block>
<script type="module">
  const block = document.querySelector('#code-property');
  block.code = \`const gpus = [
  { name: 'B200', specs: { architecture: 'Blackwell' } },
  { name: 'H100 SXM5', specs: { architecture: 'Hopper' } }
] as const;\\n
export const blackwellGpus = gpus.filter(gpu =>
  gpu.specs.architecture.startsWith('Blackwell')
);\`;
</script>
`
};

/**
 * @summary Display line numbers alongside the source.
 */
export const LineNumbers = {
  render: () => html`
<nve-code-block language="typescript" line-numbers>
  <template>
const gpus = [
  { name: 'B200', specs: { architecture: 'Blackwell' } },
  { name: 'H100 SXM5', specs: { architecture: 'Hopper' } }
] as const;&#10;
export const blackwellGpus = gpus.filter(gpu =>
  gpu.specs.architecture.startsWith('Blackwell')
);
  </template>
</nve-code-block>
`
};

/**
 * @summary Draw attention to selected lines in numbered source.
 */
export const Highlight = {
  render: () => html`
<nve-code-block language="typescript" line-numbers highlight="7">
  <template>
const gpus = [
  { name: 'B200', specs: { architecture: 'Blackwell' } },
  { name: 'H100 SXM5', specs: { architecture: 'Hopper' } }
] as const;&#10;
export const blackwellGpus = gpus.filter(gpu =>
  gpu.specs.architecture.startsWith('Blackwell')
);
  </template>
</nve-code-block>
`
};

/**
 * @summary Constrain the block’s height and let readers scroll through longer source.
 * @tags test-case
 */
export const Overflow = {
  render: () => html`
<nve-code-block language="typescript" style="height: 112px;">
  <template>
const gpus = [
  { name: 'B200', specs: { architecture: 'Blackwell' } },
  { name: 'H100 SXM5', specs: { architecture: 'Hopper' } }
] as const;&#10;
export const blackwellGpus = gpus.filter(gpu =>
  gpu.specs.architecture.startsWith('Blackwell')
);
  </template>
</nve-code-block>
`
};

/**
 * @summary Compare horizontal scrolling and line wrapping for the same source in a constrained block.
 * @tags test-case
 */
export const LineWrap = {
  render: () => html`
<div nve-layout="column gap:md">
  <div nve-layout="column gap:sm">
    <span nve-text="body">Horizontal scrolling</span>
    <nve-code-block language="typescript" style="width: 320px; max-width: 100%; height: 112px;">
      <template>
const gpus = [
  { name: 'B200', specs: { architecture: 'Blackwell' } },
  { name: 'H100 SXM5', specs: { architecture: 'Hopper' } }
] as const;&#10;
export const blackwellGpus = gpus.filter(gpu =>
  gpu.specs.architecture.startsWith('Blackwell')
);
      </template>
    </nve-code-block>
  </div>
  <div nve-layout="column gap:sm">
    <span nve-text="body">Line wrapping</span>
    <nve-code-block language="typescript" style="width: 320px; max-width: 100%; height: 112px; --white-space: pre-wrap; overflow-wrap: anywhere;">
      <template>
const gpus = [
  { name: 'B200', specs: { architecture: 'Blackwell' } },
  { name: 'H100 SXM5', specs: { architecture: 'Hopper' } }
] as const;&#10;
export const blackwellGpus = gpus.filter(gpu =>
  gpu.specs.architecture.startsWith('Blackwell')
);
      </template>
    </nve-code-block>
  </div>
</div>
`
};

/**
 * @summary Keep the filename, copy action, and footer visible while the source scrolls.
 */
export const HeaderFooter = {
  render: () => html`
<nve-code-block id="header-footer-code" language="typescript" style="height: 216px;">
  <nve-code-block-header>
    <nve-icon slot="prefix" name="document" aria-hidden="true"></nve-icon>
    <span nve-text="body">gpu-inventory.ts</span>
    <nve-copy-button slot="suffix" aria-label="Copy source" container="inline" behavior-copy></nve-copy-button>
  </nve-code-block-header>
  <template>
const gpus = [
  { name: 'B200', specs: { architecture: 'Blackwell' } },
  { name: 'H100 SXM5', specs: { architecture: 'Hopper' } }
] as const;&#10;
export const blackwellGpus = gpus.filter(gpu =>
  gpu.specs.architecture.startsWith('Blackwell')
);
  </template>
  <nve-code-block-footer><span nve-text="body">Expected match · B200</span></nve-code-block-footer>
</nve-code-block>
<script type="module">
  const block = document.querySelector('#header-footer-code');
  const source = block.querySelector('template').content.textContent.trim();
  block.code = source;
  block.querySelector('nve-copy-button').value = source;
</script>
`
};

/**
 * @summary Match the surrounding layout with default, flat, or inline container framing.
 * @tags test-case
 */
export const Container = {
  render: () => html`
<div nve-layout="column gap:md align:horizontal-stretch">
  <div nve-layout="column gap:sm align:horizontal-stretch">
    <span nve-text="body">Default</span>
    <nve-code-block language="typescript">
      <template>
const gpus = [
  { name: 'B200', specs: { architecture: 'Blackwell' } },
  { name: 'H100 SXM5', specs: { architecture: 'Hopper' } }
] as const;&#10;
export const blackwellGpus = gpus.filter(gpu =>
  gpu.specs.architecture.startsWith('Blackwell')
);
      </template>
    </nve-code-block>
  </div>
  <div nve-layout="column gap:sm align:horizontal-stretch">
    <span nve-text="body">Flat</span>
    <nve-code-block language="typescript" container="flat">
      <template>
const gpus = [
  { name: 'B200', specs: { architecture: 'Blackwell' } },
  { name: 'H100 SXM5', specs: { architecture: 'Hopper' } }
] as const;&#10;
export const blackwellGpus = gpus.filter(gpu =>
  gpu.specs.architecture.startsWith('Blackwell')
);
      </template>
    </nve-code-block>
  </div>
  <div nve-layout="column gap:sm align:horizontal-stretch">
    <span nve-text="body">Inline</span>
    <nve-code-block language="typescript" container="inline">
      <template>
const gpus = [
  { name: 'B200', specs: { architecture: 'Blackwell' } },
  { name: 'H100 SXM5', specs: { architecture: 'Hopper' } }
] as const;&#10;
export const blackwellGpus = gpus.filter(gpu =>
  gpu.specs.architecture.startsWith('Blackwell')
);
      </template>
    </nve-code-block>
  </div>
</div>
`
};

/**
 * @summary Codeblock with container styling for different visual contexts.
 * @tags test-case
 */
export const ContainerHeaderFooter = {
  render: () => html`
<div nve-layout="column gap:md">
  <nve-code-block language="text" container="inline">
    <nve-code-block-header>
      <span nve-text="body">Setup</span>
      <nve-icon-button slot="suffix" icon-name="copy" aria-label="Copy setup commands" container="inline"></nve-icon-button>
    </nve-code-block-header>
    <template>
# install CLI
curl -fsSL https://nvidia.github.io/elements/install.sh | bash

# create a new project
nve project.create

# configure dependencies and MCP tools
nve project.setup
    </template>
    <nve-code-block-footer><span nve-text="body">Shell commands</span></nve-code-block-footer>
  </nve-code-block>

  <nve-code-block language="text" container="flat">
    <nve-code-block-header>
      <span nve-text="body">Setup</span>
      <nve-icon-button slot="suffix" icon-name="copy" aria-label="Copy setup commands" container="inline"></nve-icon-button>
    </nve-code-block-header>
    <template>
# install CLI
curl -fsSL https://nvidia.github.io/elements/install.sh | bash

# create a new project
nve project.create

# configure dependencies and MCP tools
nve project.setup
    </template>
    <nve-code-block-footer><span nve-text="body">Shell commands</span></nve-code-block-footer>
  </nve-code-block>

  <nve-code-block language="text">
    <nve-code-block-header>
      <span nve-text="body">Setup</span>
      <nve-icon-button slot="suffix" icon-name="copy" aria-label="Copy setup commands" container="inline"></nve-icon-button>
    </nve-code-block-header>
    <template>
# install CLI
curl -fsSL https://nvidia.github.io/elements/install.sh | bash

# create a new project
nve project.create

# configure dependencies and MCP tools
nve project.setup
    </template>
    <nve-code-block-footer><span nve-text="body">Shell commands</span></nve-code-block-footer>
  </nve-code-block>
</div>
  `
};
/**
 * @summary Make nested expressions easier to follow by giving matching brackets the same color.
 */
export const BracketColoring = {
  render: () => html`
<nve-code-block language="typescript" bracket-pair-coloring>
  <template>
const gpus = [
  { name: 'B200', specs: { architecture: 'Blackwell' } },
  { name: 'H100 SXM5', specs: { architecture: 'Hopper' } }
] as const;&#10;
export const blackwellGpus = gpus.filter(gpu =>
  gpu.specs.architecture.startsWith('Blackwell')
);
  </template>
</nve-code-block>
`
};
