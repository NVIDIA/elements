import { describe, it, expect } from 'vitest';
import {
  createPlaygroundURL,
  createAngularFiles,
  createAngularPlaygroundURL,
  createLitFiles,
  createLitPlaygroundURL,
  createReactFiles,
  createReactPlaygroundURL,
  createPreactPlaygroundURL,
  createPreactFiles
} from './playground.js';
import type { MetadataSummary } from '../types.js';

describe('createPlaygroundURL', () => {
  const metadata = {
    created: '2021-01-01',
    projects: {
      '@nvidia-elements/core': {
        elements: [
          {
            name: 'nve-button',
            manifest: { metadata: { entrypoint: '@nvidia-elements/core/button', markdown: ' ### Import ' } }
          }
        ]
      },
      '@nvidia-elements/monaco': {
        elements: [
          { name: 'nve-monaco', manifest: { metadata: { entrypoint: '@nvidia-elements/monaco/monaco', markdown: ' ### Import ' } } }
        ]
      }
    }
  } as unknown as MetadataSummary;

  it('should create a playground URL', () => {
    const url = createPlaygroundURL('nve-button', metadata);
    expect(url.includes('?version=1&layout=vertical-split&file=index.html&files=')).toBe(true);
  });

  it('should create a playground URL with a custom name', () => {
    const url = createPlaygroundURL('nve-button', metadata, { name: 'nve-button' });
    expect(url.includes('?version=1&layout=vertical-split&name=nve-button&file=index.html&files=')).toBe(true);
  });

  it('should create a playground URL with a theme', () => {
    const url = createPlaygroundURL('nve-button', metadata, { theme: 'light' });
    expect(url.includes('?version=1&layout=vertical-split&theme=light&file=index.html&files=')).toBe(true);
  });

  it('should create a playground URL with a referer', () => {
    const url = createPlaygroundURL('nve-button', metadata, {
      referer: 'https://www.nvidia.com'
    });
    expect(url.includes('?version=1&layout=vertical-split&file=index.html&ref=https://www.nvidia.com&files=')).toBe(
      true
    );
  });
});

describe('createReactPlaygroundURL', () => {
  const metadata = {
    created: '2021-01-01',
    projects: {
      '@nvidia-elements/core': {
        elements: [
          {
            name: 'nve-button',
            manifest: { metadata: { entrypoint: '@nvidia-elements/core/button', markdown: ' ### Import ' } }
          }
        ]
      },
      '@nvidia-elements/monaco': {
        elements: [
          { name: 'nve-monaco', manifest: { metadata: { entrypoint: '@nvidia-elements/monaco/monaco', markdown: ' ### Import ' } } }
        ]
      }
    }
  } as unknown as MetadataSummary;

  it('should create a React playground URL', () => {
    const url = createReactPlaygroundURL('nve-button', metadata);
    expect(url.includes('?version=1&layout=vertical-split&name=react&file=index.tsx&files=')).toBe(true);
  });

  it('should create a React playground URL with a custom name', () => {
    const url = createReactPlaygroundURL('nve-button', metadata, { name: 'nve-button' });
    expect(url.includes('?version=1&layout=vertical-split&name=react%20nve-button&file=index.tsx&files=')).toBe(true);
  });

  it('should create a React playground URL with a referer', () => {
    const url = createReactPlaygroundURL('nve-button', metadata, {
      name: 'nve-button',
      referer: 'https://www.nvidia.com'
    });
    expect(
      url.includes(
        '?version=1&layout=vertical-split&name=react%20nve-button&file=index.tsx&ref=https://www.nvidia.com&files='
      )
    ).toBe(true);
  });

  it('should bootstrap React files needed for the playground', () => {
    const files = createReactFiles('<nve-button></nve-button>', metadata, { name: 'nve-button', theme: 'light' });
    expect(files['index.html'].content.includes('<div id="root"></div>')).toBe(true);
    expect(files['index.tsx'].content.includes(`import React from 'react'`)).toBe(true);
    expect(files['global.ts'].content.includes(`declare module 'react' {`)).toBe(true);
    expect(files['importmap.json'].content.includes('"react-dom": "https://esm.nvidia.com/react-dom@19"')).toBe(true);
  });
});

describe('createPreactPlaygroundURL', () => {
  const metadata = {
    created: '2021-01-01',
    projects: {
      '@nvidia-elements/core': {
        elements: [
          {
            name: 'nve-button',
            manifest: { metadata: { entrypoint: '@nvidia-elements/core/button', markdown: ' ### Import ' } }
          }
        ]
      },
      '@nvidia-elements/monaco': {
        elements: [
          { name: 'nve-monaco', manifest: { metadata: { entrypoint: '@nvidia-elements/monaco/monaco', markdown: ' ### Import ' } } }
        ]
      }
    }
  } as unknown as MetadataSummary;

  it('should create a Preact playground URL', () => {
    const url = createPreactPlaygroundURL('nve-button', metadata);
    expect(url.includes('?version=1&layout=vertical-split&name=preact&file=index.tsx&files=')).toBe(true);
  });

  it('should create a Preact playground URL with a custom name', () => {
    const url = createPreactPlaygroundURL('nve-button', metadata, { name: 'nve-button' });
    expect(url.includes('?version=1&layout=vertical-split&name=preact%20nve-button&file=index.tsx&files=')).toBe(true);
  });

  it('should create a Preact playground URL with a referer', () => {
    const url = createPreactPlaygroundURL('nve-button', metadata, {
      name: 'nve-button',
      referer: 'https://www.nvidia.com'
    });
    expect(
      url.includes(
        '?version=1&layout=vertical-split&name=preact%20nve-button&file=index.tsx&ref=https://www.nvidia.com&files='
      )
    ).toBe(true);
  });

  it('should bootstrap Preact files needed for the playground', () => {
    const files = createPreactFiles('<nve-button></nve-button>', metadata, { name: 'nve-button' });
    expect(files['index.html'].content.includes('<div id="root"></div>')).toBe(true);
    expect(files['index.tsx'].content.includes(`import { render } from 'preact'`)).toBe(true);
    expect(files['global.ts'].content.includes(`namespace preact.JSX`)).toBe(true);
    expect(files['importmap.json'].content.includes('"preact": "https://esm.nvidia.com/preact@10"')).toBe(true);
  });
});

describe('createAngularPlaygroundURL', () => {
  const metadata = {
    created: '2021-01-01',
    projects: {
      '@nvidia-elements/core': {
        elements: [
          {
            name: 'nve-button',
            manifest: { metadata: { entrypoint: '@nvidia-elements/core/button', markdown: ' ### Import ' } }
          }
        ]
      },
      '@nvidia-elements/monaco': {
        elements: [
          { name: 'nve-monaco', manifest: { metadata: { entrypoint: '@nvidia-elements/monaco/monaco', markdown: ' ### Import ' } } }
        ]
      }
    }
  } as unknown as MetadataSummary;

  it('should create a Angular playground URL', () => {
    const url = createAngularPlaygroundURL('nve-button', metadata);
    expect(url.includes('?version=1&layout=vertical-split&name=angular&file=index.ts&files=')).toBe(true);
  });

  it('should create a Angular playground URL with a custom name', () => {
    const url = createAngularPlaygroundURL('nve-button', metadata, { name: 'nve-button' });
    expect(url.includes('?version=1&layout=vertical-split&name=angular%20nve-button&file=index.ts&files=')).toBe(true);
  });

  it('should create a Angular playground URL with a referer', () => {
    const url = createAngularPlaygroundURL('nve-button', metadata, {
      name: 'nve-button',
      referer: 'https://www.nvidia.com'
    });
    expect(
      url.includes(
        '?version=1&layout=vertical-split&name=angular%20nve-button&file=index.ts&ref=https://www.nvidia.com&files='
      )
    ).toBe(true);
  });

  it('should bootstrap createAngularPlaygroundURL files needed for the playground', () => {
    const files = createAngularFiles('<nve-button></nve-button>', metadata, { name: 'nve-button', theme: 'light' });
    expect(files['index.html'].content.includes('<app-root></app-root>')).toBe(true);
    expect(files['index.ts'].content.includes(`import 'zone.js'`)).toBe(true);
    expect(files['importmap.json'].content.includes('"@angular/core": "https://esm.nvidia.com/@angular/core@')).toBe(true);
  });
});

describe('createLitPlaygroundURL', () => {
  const metadata = {
    created: '2021-01-01',
    projects: {
      '@nvidia-elements/core': {
        elements: [
          {
            name: 'nve-button',
            manifest: { metadata: { entrypoint: '@nvidia-elements/core/button', markdown: ' ### Import ' } }
          }
        ]
      },
      '@nvidia-elements/monaco': {
        elements: [
          { name: 'nve-monaco', manifest: { metadata: { entrypoint: '@nvidia-elements/monaco/monaco', markdown: ' ### Import ' } } }
        ]
      }
    }
  } as unknown as MetadataSummary;

  it('should create a Lit playground URL', () => {
    const url = createLitPlaygroundURL('nve-button', metadata);
    expect(url.includes('?version=1&layout=vertical-split&name=lit&file=index.ts&files=')).toBe(true);
  });

  it('should create a Lit playground URL with a custom name', () => {
    const url = createLitPlaygroundURL('nve-button', metadata, { name: 'nve-button' });
    expect(url.includes('?version=1&layout=vertical-split&name=lit%20nve-button&file=index.ts&files=')).toBe(true);
  });

  it('should create a Lit playground URL with a referer', () => {
    const url = createLitPlaygroundURL('nve-button', metadata, {
      name: 'nve-button',
      referer: 'https://www.nvidia.com'
    });
    expect(
      url.includes(
        '?version=1&layout=vertical-split&name=lit%20nve-button&file=index.ts&ref=https://www.nvidia.com&files='
      )
    ).toBe(true);
  });

  it('should bootstrap createLitPlaygroundURL files needed for the playground', () => {
    const files = createLitFiles('<nve-button></nve-button>', metadata, { name: 'nve-button', theme: 'light' });
    expect(files['index.html'].content.includes('<app-root></app-root>')).toBe(true);
    expect(files['index.ts'].content.includes(`import { LitElement, html } from 'lit'`)).toBe(true);
    expect(files['importmap.json'].content.includes('"lit": "https://esm.nvidia.com/lit@latest"')).toBe(true);
  });
});
