import '@lit-labs/ssr-client/lit-element-hydrate-support.js';

import '@nvidia-elements/code/codeblock/define.js';
import '@nvidia-elements/code/codeblock/languages/html.js';
import '@nvidia-elements/code/codeblock/languages/typescript.js';
import '@nvidia-elements/code/codeblock/languages/xml.js';
import type { CodeBlock } from '@nvidia-elements/code/codeblock/index.js';

import './_internal/animated-build/animated-build.js';

import './_internal/framework-selector/index.js';
import { frameworksById } from './_internal/framework-selector/frameworks.js';
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

  // workaround for syntax highlighting issue for Lit example
  const customStyle = globalThis.document.createElement('style');
  customStyle.textContent = `
    .hljs-subst:has(.hljs-variable.language_) {
      color: var(--nve-text-color) !important;
    }
  `;
  codeblock.shadowRoot?.appendChild(customStyle);

  function updateCodeblock() {
    const framework = frameworksById.get(selector.value);
    if (!framework) {
      throw new Error(`Framework not found: ${selector.value}`);
    }
    codeblock.language = framework.example.language;
    codeblock.code = framework.example.code;
  }
  updateCodeblock();
  selector.addEventListener('change', () => {
    updateCodeblock();
  });
});

void globalThis.customElements.whenDefined('nvd-theme-form').then(() => {
  const form = globalThis.document.querySelector<ThemeForm>('nvd-theme-form')!;
  const preview = globalThis.document.querySelector<ThemePreview>('nvd-theme-preview')!;
  form.addEventListener('input', () => {
    preview.settings = form.value;
  });
});

globalThis.document.querySelectorAll('.content:has(video)').forEach(video => {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      const video = entry.target.querySelector('video')!;
      if (entry.isIntersecting) {
        void video.play();
      } else {
        void video.pause();
      }
    });
  });
  observer.observe(video);
});
