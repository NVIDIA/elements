import '@nvidia-elements/code/codeblock/define.js';
import '@nvidia-elements/code/codeblock/languages/html.js';
import type { CodeBlock } from '@nvidia-elements/code/codeblock/index.js';

import './_internal/framework-selector/index.js';
import type { FrameworkSelector } from './_internal/framework-selector/index.js';

import './_internal/glassmorphic-card/glassmorphic-card.js';
import './_internal/metrics-carousel/metrics-carousel.js';
import './_internal/svg-trend/svg-trend.js';
import './_internal/starry-sky/starry-sky.js';

import './_internal/theme-form/theme-form.js';
import type { ThemeForm } from './_internal/theme-form/theme-form.js';

import './_internal/theme-preview/theme-preview.js';
import type { ThemePreview } from './_internal/theme-preview/theme-preview.js';

void Promise.all([
  globalThis.customElements.whenDefined('nvd-framework-selector'),
  globalThis.customElements.whenDefined('nve-codeblock')
]).then(() => {
  const selector = globalThis.document.querySelector<FrameworkSelector>('nvd-framework-selector')!;
  const codeblock = globalThis.document.querySelector<CodeBlock>('nve-codeblock')!;
  codeblock.code = `<!-- ${selector.value} -->`;
  selector.addEventListener('change', () => {
    codeblock.code = `<!-- ${selector.value} -->`;
  });
});

void globalThis.customElements.whenDefined('nvd-theme-form').then(() => {
  const form = globalThis.document.querySelector<ThemeForm>('nvd-theme-form')!;
  const preview = globalThis.document.querySelector<ThemePreview>('nvd-theme-preview')!;
  form.addEventListener('input', () => {
    preview.settings = form.value;
  });
});
