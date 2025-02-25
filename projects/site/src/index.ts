import '@nvidia-elements/code/codeblock/define.js';
import '@nvidia-elements/code/codeblock/languages/html.js';
import type { CodeBlock } from '@nvidia-elements/code/codeblock/index.js';

import './_internal/framework-selector/index.js';
import type { FrameworkSelector } from './_internal/framework-selector/index.js';

import './_internal/glassmorphic-card/glassmorphic-card.js';
import './_internal/metrics-carousel/metrics-carousel.js';
import './_internal/starry-sky/starry-sky.js';

window.customElements.whenDefined('nvd-framework-selector').then(() => {
  const selector = document.querySelector<FrameworkSelector>('nvd-framework-selector')!;
  const codeblock = document.querySelector<CodeBlock>('nve-codeblock')!;
  codeblock.code = `<!-- ${selector.value} -->`;
  selector.addEventListener('change', _event => {
    codeblock.code = `<!-- ${selector.value} -->`;
  });
});
