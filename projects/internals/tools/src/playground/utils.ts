import { gzipSync } from 'fflate';
import format from 'html-format';
import type { Element } from '@internals/metadata';
import { getElementImports } from '../internal/utils.js';
import { validateTemplate } from '../internal/validate.js';

declare const __ELEMENTS_PLAYGROUND_BASE_URL__: string;
declare const __ELEMENTS_ESM_CDN_BASE_URL__: string;

interface PlaygroundOptions {
  type?: PlaygroundType;
  theme?: string;
  name?: string;
  referer?: string;
  openFile?: string;
  trustedContent?: boolean;
}

export const playgroundTypes = ['default', 'react', 'preact', 'angular', 'lit', 'vue'] as const;

export type PlaygroundType = (typeof playgroundTypes)[number];

export const defaultTemplate =
  '<nve-page>\n  <nve-page-header slot="header">\n    <nve-logo slot="prefix" size="sm" color="brand-green">NV</nve-logo>\n    <h2 slot="prefix" nve-text="heading">NVIDIA</h2>\n  </nve-page-header>\n  <main nve-layout="column gap:lg pad:lg">\n    <!-- template content here -->\n  </main>\n</nve-page>';

export async function resolveTemplate({ template, path }: { template?: string; path?: string }): Promise<string> {
  const hasInvalidTemplate = template && template.length > 0 && template !== defaultTemplate;

  if (hasInvalidTemplate && path) {
    throw new Error('Provide either "template" or "path", not both.');
  }

  // only load in node environment when caller supplies a path
  if (path) {
    const { readFileSync } = await import('node:fs');
    return readFileSync(path, 'utf8');
  }

  if (template !== undefined) {
    return template;
  }

  throw new Error('Either "template" or "path" is required.');
}

const frameworkConfigs: Record<
  string,
  {
    createFiles: (
      content: string,
      elements: Element[],
      options: PlaygroundOptions
    ) => Record<string, { content: string }>;
    openFile: string;
  }
> = {
  react: { createFiles: createReactFiles, openFile: 'index.tsx' },
  preact: { createFiles: createPreactFiles, openFile: 'index.tsx' },
  angular: { createFiles: createAngularFiles, openFile: 'index.ts' },
  lit: { createFiles: createLitFiles, openFile: 'index.ts' },
  vue: { createFiles: createVueFiles, openFile: 'index.ts' }
};

export function createPlaygroundURL(source: string, elements: Element[], opts: PlaygroundOptions = {}) {
  const options: PlaygroundOptions = { name: '', type: 'default', ...opts };
  options.name = options.name && options.name !== 'undefined' ? options.name : '';
  options.type = options.type || 'default';
  const result = options.trustedContent ? source : validateTemplate(source, elements);
  const formattedSource = formatTemplate(result);

  const config = frameworkConfigs[options.type!];
  if (config) {
    return createURL(serialize(config.createFiles(formattedSource, elements, options)), {
      ...options,
      openFile: config.openFile,
      name: `${options.type} ${options.name}`.trim()
    });
  }

  return createURL(serialize(createDefaultFiles(formattedSource, elements, options)), options);
}

export function createDefaultFiles(content: string, elements: Element[], options: PlaygroundOptions) {
  const files: Record<string, { content: string }> = {
    'index.html': { content: createIndexHTML(content, options) },
    'index.ts': { content: `${getElementImports(content, elements).join('\n')}` },
    'importmap.json': { content: createImportMap() }
  };

  // Add styles CSS file if this is from layout or responsive examples
  if (options.name?.includes('@nvidia-elements/styles/layout.examples.json')) {
    files['styles.css'] = { content: createLayoutStyles() };
  } else if (options.name?.includes('@nvidia-elements/styles/responsive.examples.json')) {
    files['styles.css'] = { content: createResponsiveStyles() };
  } else if (options.name?.includes('@nvidia-elements/styles/responsive-patterns.examples.json')) {
    files['styles.css'] = { content: '' };
  }

  return files;
}

export function createReactFiles(content: string, elements: Element[], options: PlaygroundOptions) {
  return {
    'index.html': { content: createIndexHTML(`<div id="root"></div>`, options) },
    'index.tsx': { content: createReactIndexTSX(content, elements) },
    'global.ts': { content: createReactTSXGlobal() },
    'importmap.json': { content: createImportMap('react') }
  };
}

export function createPreactFiles(content: string, elements: Element[], options: PlaygroundOptions) {
  return {
    'index.html': { content: createIndexHTML(`<div id="root"></div>`, options) },
    'index.tsx': { content: createPreactIndexTSX(content, elements) },
    'global.ts': { content: createPreactTSXGlobal() },
    'importmap.json': { content: createImportMap('preact') }
  };
}

export function createAngularFiles(content: string, elements: Element[], options: PlaygroundOptions) {
  return {
    'index.html': { content: createIndexHTML(`<app-root></app-root>`, options) },
    'index.ts': { content: createAngularIndexTS(content, elements) },
    'importmap.json': { content: createImportMap('angular') }
  };
}

export function createLitFiles(content: string, elements: Element[], options: PlaygroundOptions) {
  return {
    'index.html': { content: createIndexHTML(`<app-root></app-root>`, options) },
    'index.ts': { content: createLitIndexTS(content, elements) },
    'importmap.json': { content: createImportMap('lit') }
  };
}

export function createVueFiles(content: string, elements: Element[], options: PlaygroundOptions) {
  return {
    'index.html': { content: createIndexHTML(createVueHTML(content), options) },
    'index.ts': { content: createVueIndexTS(content, elements) },
    'importmap.json': { content: createImportMap('vue') }
  };
}

function createURL(files: string, options: PlaygroundOptions) {
  const defaultOptions = { openFile: 'index.html', ...options };
  return __ELEMENTS_PLAYGROUND_BASE_URL__?.length > 0
    ? encodeURI(
        `${__ELEMENTS_PLAYGROUND_BASE_URL__}/?version=1&layout=vertical-split${defaultOptions.name ? `&name=${defaultOptions.name.trim()}` : ''}${defaultOptions.theme ? `&theme=${defaultOptions.theme}` : ''}&file=${defaultOptions.openFile}${defaultOptions.referer ? `&ref=${defaultOptions.referer}` : ''}&files=${files}`
      )
    : '';
}

function createLayoutStyles() {
  return `/* Layout example styles */
section[nve-layout~='row'][nve-layout*='align'] {
  min-height: 220px !important;
}

section[nve-layout~='column'][nve-layout*='align'] {
  min-height: 320px !important;
}

section[nve-layout~='grid'][nve-layout*='align'] {
  min-height: 220px !important;
}

nve-card {
  --background: var(--nve-sys-layer-overlay-background);
  min-height: 60px;
  min-width: 60px;
}
`;
}

function createResponsiveStyles() {
  return `/* Responsive example styles */
nve-card {
  min-width: 120px;
  min-height: 120px;
  --background: oklab(0.2776 0.0214875 -0.0624042);
}

nve-logo.large {
  --width: 200px;
  --height: 200px;
}
`;
}

function serialize(data: Record<string, { content: string }>, compress = true) {
  const encoded = new TextEncoder().encode(JSON.stringify(data));
  const array = compress ? gzipSync(encoded) : encoded;
  const base64 = globalThis.btoa(String.fromCharCode(...array));
  return encodeURIComponent(base64);
}

function createIndexHTML(content: string, options: PlaygroundOptions) {
  // Check if this is from the layout or responsive examples file
  const isLayoutExample = options.name?.includes('@nvidia-elements/styles/layout.examples.json');
  const isResponsiveExample = options.name?.includes('@nvidia-elements/styles/responsive.examples.json');
  const isResponsivePatternsExample = options.name?.includes('@nvidia-elements/styles/responsive-patterns.examples.json');

  // Add link to styles CSS if needed
  const layoutExamplesStyles =
    isLayoutExample || isResponsiveExample || isResponsivePatternsExample
      ? `
    <link rel="stylesheet" type="text/css" href="@nvidia-elements/styles/dist/labs/layout-viewport.css" />
    <link rel="stylesheet" type="text/css" href="@nvidia-elements/styles/dist/labs/layout-container.css" />
    <link rel="stylesheet" type="text/css" href="./styles.css" />`
      : '';

  return `<!doctype html>
<html nve-theme="${options.theme ?? ''}">
  <head>
    <link rel="stylesheet" type="text/css" href="@nvidia-elements/themes/dist/fonts/inter.css" />
    <link rel="stylesheet" type="text/css" href="@nvidia-elements/themes/dist/index.css" />
    <link rel="stylesheet" type="text/css" href="@nvidia-elements/themes/dist/dark.css" />
    <link rel="stylesheet" type="text/css" href="@nvidia-elements/themes/dist/high-contrast.css" />
    <link rel="stylesheet" type="text/css" href="@nvidia-elements/themes/dist/reduced-motion.css" />
    <link rel="stylesheet" type="text/css" href="@nvidia-elements/themes/dist/compact.css" />
    <link rel="stylesheet" type="text/css" href="@nvidia-elements/themes/dist/debug.css" />
    <link rel="stylesheet" type="text/css" href="@nvidia-elements/styles/dist/typography.css" />
    <link rel="stylesheet" type="text/css" href="@nvidia-elements/styles/dist/layout.css" />
    ${layoutExamplesStyles}
    <script type="module" src="./index.js"></script>
  </head>
  <body nve-text="body" nve-layout="${!content.includes('<nve-page') ? 'pad:md' : ''}">
${content.trim()}
  </body>
</html>`;
}

function createImportMap(framework: 'react' | 'preact' | 'angular' | 'lit' | 'vue' | 'vanilla' = 'vanilla') {
  const CDN_MODULES_URL = __ELEMENTS_ESM_CDN_BASE_URL__;

  const importmap: { imports: Record<string, string> } = {
    imports: {
      '@nvidia-elements/core': `${CDN_MODULES_URL}/@nvidia-elements/core@latest`,
      '@nvidia-elements/core/': `${CDN_MODULES_URL}/@nvidia-elements/core@latest/`,
      '@nvidia-elements/styles': `${CDN_MODULES_URL}/@nvidia-elements/styles@latest`,
      '@nvidia-elements/styles/': `${CDN_MODULES_URL}/@nvidia-elements/styles@latest/`,
      '@nvidia-elements/themes': `${CDN_MODULES_URL}/@nvidia-elements/themes@latest`,
      '@nvidia-elements/themes/': `${CDN_MODULES_URL}/@nvidia-elements/themes@latest/`,
      '@nvidia-elements/monaco': `${CDN_MODULES_URL}/@nvidia-elements/monaco@latest`,
      '@nvidia-elements/monaco/': `${CDN_MODULES_URL}/@nvidia-elements/monaco@latest/`,
      '@nvidia-elements/code': `${CDN_MODULES_URL}/@nvidia-elements/code@latest`,
      '@nvidia-elements/code/': `${CDN_MODULES_URL}/@nvidia-elements/code@latest/`,
      '@nvidia-elements/forms': `${CDN_MODULES_URL}/@nvidia-elements/forms@latest`,
      '@nvidia-elements/forms/': `${CDN_MODULES_URL}/@nvidia-elements/forms@latest/`
    }
  };

  if (framework === 'react') {
    importmap.imports['react-dom'] = `${CDN_MODULES_URL}/react-dom@19`;
    importmap.imports['react-dom/'] = `${CDN_MODULES_URL}/react-dom@19/`;
    importmap.imports['react'] = `${CDN_MODULES_URL}/react@19`;
    importmap.imports['react/'] = `${CDN_MODULES_URL}/react@19/`;
  }

  if (framework === 'preact') {
    importmap.imports['preact'] = `${CDN_MODULES_URL}/preact@10`;
    importmap.imports['preact/'] = `${CDN_MODULES_URL}/preact@10/`;
  }

  if (framework === 'angular') {
    importmap.imports['@angular/compiler'] = `${CDN_MODULES_URL}/@angular/compiler@20.0.0`;
    importmap.imports['@angular/core'] = `${CDN_MODULES_URL}/@angular/core@20.0.0`;
    importmap.imports['@angular/platform-browser'] = `${CDN_MODULES_URL}/@angular/platform-browser@20.0.0`;
    importmap.imports['zone.js'] = `${CDN_MODULES_URL}/zone.js`;
  }

  if (framework === 'lit') {
    importmap.imports['lit'] = `${CDN_MODULES_URL}/lit@latest`;
    importmap.imports['lit/'] = `${CDN_MODULES_URL}/lit@latest/`;
  }

  if (framework === 'vue') {
    importmap.imports['vue'] = `${CDN_MODULES_URL}/vue@3`;
    importmap.imports['vue/'] = `${CDN_MODULES_URL}/vue@3/`;
  }

  return JSON.stringify(importmap, null, 2);
}

function createReactIndexTSX(content: string, elements: Element[]) {
  return `import React from 'react';
import { createRoot } from 'react-dom/client';
${getElementImports(content, elements).join('\n')}

function App() {
  return (
    <>
      ${content}
    </>
  );
}

const root = createRoot(document.getElementById('root'));
root.render(<App />);`;
}

function createReactTSXGlobal() {
  return `import type { CustomElements } from '@nvidia-elements/core/dist/custom-elements-jsx.d.ts';

declare module 'react' {
  namespace JSX {
    interface IntrinsicElements extends CustomElements {}
  }
}`;
}

function createPreactIndexTSX(content: string, elements: Element[]) {
  return `/** @jsxImportSource preact */
import { render } from 'preact';
${getElementImports(content, elements).join('\n')}

function App() {
  return (
    <>
      ${content}
    </>
  );
}
render(<App />, document.getElementById('root'));`;
}

function createPreactTSXGlobal() {
  return `import type { CustomElements } from '@nvidia-elements/core/dist/custom-elements-jsx.d.ts';

declare global {
  namespace preact.JSX {
    interface IntrinsicElements extends CustomElements { }
  }
}`;
}

function createAngularIndexTS(content: string, elements: Element[]) {
  return `import 'zone.js';
import '@angular/compiler';
import { bootstrapApplication } from '@angular/platform-browser';
import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
${getElementImports(content, elements).join('\n')}

@Component({
  selector: 'app-root',
  styles: [\`
    :host { display: block; }
  \`],
  template: \`
    ${content}
  \`,
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class App {
  constructor() { }

  ngOnInit() {

  }
}

bootstrapApplication(App);
`;
}

function createLitIndexTS(content: string, elements: Element[]) {
  return `import { LitElement, html } from 'lit';
import { customElement } from 'lit/decorators/custom-element.js';
${getElementImports(content, elements).join('\n')}

@customElement('app-root')
export class App extends LitElement {
  render() {
    return html\`
      ${content}
    \`;
  }
}`;
}

function createVueIndexTS(content: string, elements: Element[]) {
  return `import { createApp, ref } from 'vue/dist/vue.esm-browser.js';
import '@nvidia-elements/core/button/define.js';
${getElementImports(content, elements).join('\n')}

createApp({
  setup() {
    return {
      count: ref(0)
    }
  }
}).mount('#app');`;
}

function createVueHTML(content: string) {
  return /* html */ `
<div id="app" nve-layout="column gap:md align:left">
  ${content}
  <nve-button @click="count++">Count is: {{ count }}</nve-button>
</div>`.trim();
}

export function formatTemplate(source: string) {
  return format(
    source.replaceAll(' nve-theme="dark"', '').replaceAll(' nve-theme="light"', '').replaceAll(' nve-theme="root"', ''),
    ' '.repeat(2),
    120
  );
}
