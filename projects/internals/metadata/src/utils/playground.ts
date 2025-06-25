import { gzipSync } from 'fflate';
import format from 'html-format';
import { getElementImports } from './utils.js';
import { validateTemplate } from './validate.js';
import type { MetadataSummary } from '../types.js';

interface PlaygroundOptions {
  theme?: string;
  name?: string;
  referer?: string;
  openFile?: string;
  trustedContent?: boolean;
}

export function createPlaygroundURL(source: string, metadata: MetadataSummary, options: PlaygroundOptions = {}) {
  const sanitizedSource = options.trustedContent ? source : validateTemplate(source, metadata);
  const formattedSource = formatTemplate(sanitizedSource);
  const files = serialize(createDefaultFiles(formattedSource, metadata, options));
  return createURL(files, options);
}

export function createReactPlaygroundURL(source: string, metadata: MetadataSummary, options: PlaygroundOptions = {}) {
  const sanitizedSource = options.trustedContent ? source : validateTemplate(source, metadata);
  const formattedSource = formatTemplate(sanitizedSource);
  const files = serialize(createReactFiles(formattedSource, metadata, options));
  return createURL(files, { ...options, openFile: 'index.tsx', name: `react ${options.name ?? ''}` });
}

export function createPreactPlaygroundURL(source: string, metadata: MetadataSummary, options: PlaygroundOptions = {}) {
  const sanitizedSource = options.trustedContent ? source : validateTemplate(source, metadata);
  const formattedSource = formatTemplate(sanitizedSource);
  const files = serialize(createPreactFiles(formattedSource, metadata, options));
  return createURL(files, { ...options, openFile: 'index.tsx', name: `preact ${options.name ?? ''}` });
}

export function createAngularPlaygroundURL(source: string, metadata: MetadataSummary, options: PlaygroundOptions = {}) {
  const sanitizedSource = options.trustedContent ? source : validateTemplate(source, metadata);
  const formattedSource = formatTemplate(sanitizedSource);
  const files = serialize(createAngularFiles(formattedSource, metadata, options));
  return createURL(files, { ...options, openFile: 'index.ts', name: `angular ${options.name ?? ''}` });
}

export function createLitPlaygroundURL(source: string, metadata: MetadataSummary, options: PlaygroundOptions = {}) {
  const sanitizedSource = options.trustedContent ? source : validateTemplate(source, metadata);
  const formattedSource = formatTemplate(sanitizedSource);
  const files = serialize(createLitFiles(formattedSource, metadata, options));
  return createURL(files, { ...options, openFile: 'index.ts', name: `lit ${options.name ?? ''}` });
}

export function createDefaultFiles(content, metadata: MetadataSummary, options: PlaygroundOptions) {
  return {
    'index.html': { content: createIndexHTML(content, options) },
    'index.ts': { content: `${getElementImports(content, metadata).join('\n')}` },
    'importmap.json': { content: createImportMap() }
  };
}

export function createReactFiles(content, metadata: MetadataSummary, options: PlaygroundOptions) {
  return {
    'index.html': { content: createIndexHTML(`<div id="root"></div>`, options) },
    'index.tsx': { content: createReactIndexTSX(content, metadata) },
    'global.ts': { content: createReactTSXGlobal() },
    'importmap.json': { content: createImportMap('react') }
  };
}

export function createPreactFiles(content, metadata: MetadataSummary, options: PlaygroundOptions) {
  return {
    'index.html': { content: createIndexHTML(`<div id="root"></div>`, options) },
    'index.tsx': { content: createPreactIndexTSX(content, metadata) },
    'global.ts': { content: createPreactTSXGlobal() },
    'importmap.json': { content: createImportMap('preact') }
  };
}

export function createAngularFiles(content, metadata: MetadataSummary, options: PlaygroundOptions) {
  return {
    'index.html': { content: createIndexHTML(`<app-root></app-root>`, options) },
    'index.ts': { content: createAngularIndexTS(content, metadata) },
    'importmap.json': { content: createImportMap('angular') }
  };
}

export function createLitFiles(content, metadata: MetadataSummary, options: PlaygroundOptions) {
  return {
    'index.html': { content: createIndexHTML(`<app-root></app-root>`, options) },
    'index.ts': { content: createLitIndexTS(content, metadata) },
    'importmap.json': { content: createImportMap('lit') }
  };
}

function createURL(files: string, options: PlaygroundOptions) {
  const defaultOptions = { openFile: 'index.html', ...options };
  return `https://elements-stage.nvidia.com/ui/elements-playground/?version=1&layout=vertical-split${defaultOptions.name ? `&name=${defaultOptions.name.trim().replaceAll(' ', '%20')}` : ''}${defaultOptions.theme ? `&theme=${defaultOptions.theme}` : ''}&file=${defaultOptions.openFile}${defaultOptions.referer ? `&ref=${defaultOptions.referer}` : ''}&files=${files}`;
}

function serialize(data, compress = true) {
  const encoded = new TextEncoder().encode(JSON.stringify(data));
  const array = compress ? gzipSync(encoded) : encoded;
  const base64 = globalThis.btoa(String.fromCharCode(...array));
  return encodeURIComponent(base64);
}

function createIndexHTML(content: string, options: PlaygroundOptions) {
  return `<!doctype html>
<html nve-theme="${options.theme ?? ''}">
  <head>
    <link rel="stylesheet" type="text/css" href="@nvidia-elements/themes/dist/fonts/inter.css" />
    <link rel="stylesheet" type="text/css" href="@nvidia-elements/themes/dist/index.css" />
    <link rel="stylesheet" type="text/css" href="@nvidia-elements/themes/dist/dark.css" />
    <link rel="stylesheet" type="text/css" href="@nvidia-elements/themes/dist/high-contrast.css" />
    <link rel="stylesheet" type="text/css" href="@nvidia-elements/themes/dist/reduced-motion.css" />
    <link rel="stylesheet" type="text/css" href="@nvidia-elements/themes/dist/compact.css" />
    <link rel="stylesheet" type="text/css" href="@nvidia-elements/styles/dist/typography.css" />
    <link rel="stylesheet" type="text/css" href="@nvidia-elements/styles/dist/layout.css" />
    <script type="module" src="./index.js"></script>
  </head>
  <body nve-text="body" nve-layout="${!content.includes('<nve-page') ? 'pad:md' : ''}">
${content.trim()}
  </body>
</html>`;
}

function createImportMap(framework: 'react' | 'preact' | 'angular' | 'lit' | 'vanilla' = 'vanilla') {
  const CDN_MODULES_URL = `https://https://esm.sh`;

  const importmap = {
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

  return JSON.stringify(importmap, null, 2);
}

function createReactIndexTSX(content: string, metadata: MetadataSummary) {
  return `import React from 'react';
import { createRoot } from 'react-dom/client';
${getElementImports(content, metadata).join('\n')}

function App() {
  return (
    <div>
      ${content}
    </div>
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

function createPreactIndexTSX(content: string, metadata: MetadataSummary) {
  return `/** @jsxImportSource preact */
import { render } from 'preact';
${getElementImports(content, metadata).join('\n')}

function App() {
  return (
    <div>
      ${content}
    </div>
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

function createAngularIndexTS(content: string, metadata: MetadataSummary) {
  return `import 'zone.js';
import '@angular/compiler';
import { bootstrapApplication } from '@angular/platform-browser';
import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
${getElementImports(content, metadata).join('\n')}

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

function createLitIndexTS(content: string, metadata: MetadataSummary) {
  return `import { LitElement, html } from 'lit';
import { customElement } from 'lit/decorators/custom-element.js';
${getElementImports(content, metadata).join('\n')}

@customElement('app-root')
export class App extends LitElement {
  render() {
    return html\`
      ${content}
    \`;
  }
}`;
}

export function formatTemplate(source: string) {
  return format(
    source.replaceAll(' nve-theme="dark"', '').replaceAll(' nve-theme="light"', '').replaceAll(' nve-theme="root"', ''),
    ' '.repeat(2),
    120
  );
}
