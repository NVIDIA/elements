// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, it, expect } from 'vitest';
import type { ProjectElement } from '@internals/metadata';
import {
  createPlaygroundURL,
  createAngularFiles,
  createLitFiles,
  createReactFiles,
  createPreactFiles,
  createVueFiles,
  createDefaultFiles,
  formatTemplate,
  playgroundTypes
} from './utils.js';

// when ELEMENTS_PLAYGROUND_BASE_URL is not configured, createPlaygroundURL returns ''
const hasPlaygroundBaseURL = createPlaygroundURL('test', []).length > 0;

function expectURL(result: string, expected: string) {
  if (hasPlaygroundBaseURL) {
    expect(result).toContain(expected);
  } else {
    expect(result).toBe('');
  }
}

describe('createPlaygroundURL', () => {
  const elements: ProjectElement[] = [
    {
      name: 'nve-button',
      markdown: ' ### Import ',
      manifest: { metadata: { entrypoint: '@nvidia-elements/core/button' } }
    },
    {
      name: 'nve-monaco',
      markdown: ' ### Import ',
      manifest: { metadata: { entrypoint: '@nvidia-elements/monaco/monaco' } }
    },
    {
      name: 'nve-code',
      markdown: ' ### Import ',
      manifest: { metadata: { entrypoint: '@nvidia-elements/code/codeblock' } }
    },
    {
      name: 'nve-markdown',
      markdown: ' ### Import ',
      manifest: { metadata: { entrypoint: '@nvidia-elements/markdown/markdown' } }
    }
  ] as ProjectElement[];

  it('should create a playground URL', () => {
    const result = createPlaygroundURL('nve-button', elements);
    expectURL(result, '?version=1&layout=vertical-split&file=index.html&files=');
  });

  it('should create a playground URL with a custom name', () => {
    const result = createPlaygroundURL('nve-button', elements, { name: 'nve-button' });
    expectURL(result, '?version=1&layout=vertical-split&name=nve-button&file=index.html&files=');
  });

  it('should create a playground URL with a theme', () => {
    const result = createPlaygroundURL('nve-button', elements, { theme: 'light' });
    expectURL(result, '?version=1&layout=vertical-split&theme=light&file=index.html&files=');
  });

  it('should create a playground URL with a referer', () => {
    const result = createPlaygroundURL('nve-button', elements, {
      referer: 'https://www.nvidia.com'
    });
    expectURL(result, '?version=1&layout=vertical-split&file=index.html&ref=https://www.nvidia.com&files=');
  });
});

describe('createReactPlaygroundURL', () => {
  const elements: ProjectElement[] = [
    {
      name: 'nve-button',
      markdown: ' ### Import ',
      manifest: { metadata: { entrypoint: '@nvidia-elements/core/button' } }
    },
    {
      name: 'nve-monaco',
      markdown: ' ### Import ',
      manifest: { metadata: { entrypoint: '@nvidia-elements/monaco/monaco' } }
    }
  ] as ProjectElement[];

  it('should create a React playground URL', () => {
    const result = createPlaygroundURL('nve-button', elements, { type: 'react' });
    expectURL(result, '?version=1&layout=vertical-split&name=react&file=index.tsx&files=');
  });

  it('should create a React playground URL with a custom name', () => {
    const result = createPlaygroundURL('nve-button', elements, { name: 'nve-button', type: 'react' });
    expectURL(result, '?version=1&layout=vertical-split&name=react%20nve-button&file=index.tsx&files=');
  });

  it('should create a React playground URL with a referer', () => {
    const result = createPlaygroundURL('nve-button', elements, {
      type: 'react',
      name: 'nve-button',
      referer: 'https://www.nvidia.com'
    });
    expectURL(
      result,
      '?version=1&layout=vertical-split&name=react%20nve-button&file=index.tsx&ref=https://www.nvidia.com&files='
    );
  });

  it('should bootstrap React files needed for the playground', () => {
    const files = createReactFiles('<nve-button></nve-button>', elements, { name: 'nve-button', theme: 'light' });
    expect(files['index.html'].content.includes('<div id="root"></div>')).toBe(true);
    expect(files['index.tsx'].content.includes(`import React from 'react'`)).toBe(true);
    expect(files['global.ts'].content.includes(`declare module 'react' {`)).toBe(true);
    expect(files['importmap.json'].content).toContain('/react-dom@19');
  });
});

describe('createPreactPlaygroundURL', () => {
  const elements: ProjectElement[] = [
    {
      name: 'nve-button',
      markdown: ' ### Import ',
      manifest: { metadata: { entrypoint: '@nvidia-elements/core/button' } }
    },
    {
      name: 'nve-monaco',
      markdown: ' ### Import ',
      manifest: { metadata: { entrypoint: '@nvidia-elements/monaco/monaco' } }
    }
  ] as ProjectElement[];

  it('should create a Preact playground URL', () => {
    const result = createPlaygroundURL('nve-button', elements, { type: 'preact' });
    expectURL(result, '?version=1&layout=vertical-split&name=preact&file=index.tsx&files=');
  });

  it('should create a Preact playground URL with a custom name', () => {
    const result = createPlaygroundURL('nve-button', elements, { name: 'nve-button', type: 'preact' });
    expectURL(result, '?version=1&layout=vertical-split&name=preact%20nve-button&file=index.tsx&files=');
  });

  it('should create a Preact playground URL with a referer', () => {
    const result = createPlaygroundURL('nve-button', elements, {
      name: 'nve-button',
      type: 'preact',
      referer: 'https://www.nvidia.com'
    });
    expectURL(
      result,
      '?version=1&layout=vertical-split&name=preact%20nve-button&file=index.tsx&ref=https://www.nvidia.com&files='
    );
  });

  it('should bootstrap Preact files needed for the playground', () => {
    const files = createPreactFiles('<nve-button></nve-button>', elements, { name: 'nve-button' });
    expect(files['index.html'].content.includes('<div id="root"></div>')).toBe(true);
    expect(files['index.tsx'].content.includes(`import { render } from 'preact'`)).toBe(true);
    expect(files['global.ts'].content.includes(`namespace preact.JSX`)).toBe(true);
    expect(files['importmap.json'].content).toContain('/preact@10');
  });
});

describe('createAngularPlaygroundURL', () => {
  const elements: ProjectElement[] = [
    {
      name: 'nve-button',
      markdown: ' ### Import ',
      manifest: { metadata: { entrypoint: '@nvidia-elements/core/button' } }
    },
    {
      name: 'nve-monaco',
      markdown: ' ### Import ',
      manifest: { metadata: { entrypoint: '@nvidia-elements/monaco/monaco' } }
    }
  ] as ProjectElement[];

  it('should create a Angular playground URL', () => {
    const result = createPlaygroundURL('nve-button', elements, { type: 'angular' });
    expectURL(result, '?version=1&layout=vertical-split&name=angular&file=index.ts&files=');
  });

  it('should create a Angular playground URL with a custom name', () => {
    const result = createPlaygroundURL('nve-button', elements, { name: 'nve-button', type: 'angular' });
    expectURL(result, '?version=1&layout=vertical-split&name=angular%20nve-button&file=index.ts&files=');
  });

  it('should create a Angular playground URL with a referer', () => {
    const result = createPlaygroundURL('nve-button', elements, {
      name: 'nve-button',
      type: 'angular',
      referer: 'https://www.nvidia.com'
    });
    expectURL(
      result,
      '?version=1&layout=vertical-split&name=angular%20nve-button&file=index.ts&ref=https://www.nvidia.com&files='
    );
  });

  it('should bootstrap createAngularPlaygroundURL files needed for the playground', () => {
    const files = createAngularFiles('<nve-button></nve-button>', elements, { name: 'nve-button', theme: 'light' });
    expect(files['index.html'].content.includes('<app-root></app-root>')).toBe(true);
    expect(files['index.ts'].content.includes(`import 'zone.js'`)).toBe(true);
    expect(files['importmap.json'].content).toContain('/@angular/core@');
  });
});

describe('createLitPlaygroundURL', () => {
  const elements: ProjectElement[] = [
    {
      name: 'nve-button',
      markdown: ' ### Import ',
      manifest: { metadata: { entrypoint: '@nvidia-elements/core/button' } }
    },
    {
      name: 'nve-monaco',
      markdown: ' ### Import ',
      manifest: { metadata: { entrypoint: '@nvidia-elements/monaco/monaco' } }
    }
  ] as ProjectElement[];

  it('should create a Lit playground URL', () => {
    const result = createPlaygroundURL('nve-button', elements, { type: 'lit' });
    expectURL(result, '?version=1&layout=vertical-split&name=lit&file=index.ts&files=');
  });

  it('should create a Lit playground URL with a custom name', () => {
    const result = createPlaygroundURL('nve-button', elements, { name: 'nve-button', type: 'lit' });
    expectURL(result, '?version=1&layout=vertical-split&name=lit%20nve-button&file=index.ts&files=');
  });

  it('should create a Lit playground URL with a referer', () => {
    const result = createPlaygroundURL('nve-button', elements, {
      name: 'nve-button',
      type: 'lit',
      referer: 'https://www.nvidia.com'
    });
    expectURL(
      result,
      '?version=1&layout=vertical-split&name=lit%20nve-button&file=index.ts&ref=https://www.nvidia.com&files='
    );
  });

  it('should bootstrap createLitPlaygroundURL files needed for the playground', () => {
    const files = createLitFiles('<nve-button></nve-button>', elements, { name: 'nve-button', theme: 'light' });
    expect(files['index.html'].content.includes('<app-root></app-root>')).toBe(true);
    expect(files['index.ts'].content.includes(`import { LitElement, html } from 'lit'`)).toBe(true);
    expect(files['importmap.json'].content).toContain('/lit@latest');
  });
});

describe('createVuePlaygroundURL', () => {
  const elements: ProjectElement[] = [
    {
      name: 'nve-button',
      markdown: ' ### Import ',
      manifest: { metadata: { entrypoint: '@nvidia-elements/core/button' } }
    },
    {
      name: 'nve-monaco',
      markdown: ' ### Import ',
      manifest: { metadata: { entrypoint: '@nvidia-elements/monaco/monaco' } }
    }
  ] as ProjectElement[];

  it('should create a Vue playground URL', () => {
    const result = createPlaygroundURL('nve-button', elements, { type: 'vue' });
    expectURL(result, '?version=1&layout=vertical-split&name=vue&file=index.ts&files=');
  });

  it('should create a Vue playground URL with a custom name', () => {
    const result = createPlaygroundURL('nve-button', elements, { name: 'nve-button', type: 'vue' });
    expectURL(result, '?version=1&layout=vertical-split&name=vue%20nve-button&file=index.ts&files=');
  });

  it('should create a Vue playground URL with a referer', () => {
    const result = createPlaygroundURL('nve-button', elements, {
      name: 'nve-button',
      type: 'vue',
      referer: 'https://www.nvidia.com'
    });
    expectURL(
      result,
      '?version=1&layout=vertical-split&name=vue%20nve-button&file=index.ts&ref=https://www.nvidia.com&files='
    );
  });

  it('should bootstrap Vue files needed for the playground', () => {
    const files = createVueFiles('<nve-button></nve-button>', elements, { name: 'nve-button', theme: 'light' });
    expect(files['index.html'].content).toContain('<div id="app"');
    expect(files['index.ts'].content).toContain(`import { createApp, ref } from 'vue/dist/vue.esm-browser.js'`);
    expect(files['index.ts'].content).toContain(`.mount('#app')`);
    expect(files['importmap.json'].content).toContain('/vue@3"');
  });

  it('should wrap content in Vue app container with counter button', () => {
    const files = createVueFiles('<nve-button></nve-button>', elements, {});
    expect(files['index.html'].content).toContain('nve-layout="column gap:md align:left"');
    expect(files['index.html'].content).toContain('@click="count++"');
    expect(files['index.html'].content).toContain('{{ count }}');
  });

  it('should include element imports in index.ts', () => {
    const files = createVueFiles('<nve-button></nve-button>', elements, {});
    expect(files['index.ts'].content).toContain('@nvidia-elements/core/button');
  });
});

describe('createDefaultFiles', () => {
  const elements: ProjectElement[] = [
    {
      name: 'nve-button',
      markdown: ' ### Import ',
      manifest: { metadata: { entrypoint: '@nvidia-elements/core/button' } }
    }
  ] as ProjectElement[];

  it('should create default files with basic structure', () => {
    const files = createDefaultFiles('<nve-button></nve-button>', elements, {});
    expect(files['index.html']).toBeDefined();
    expect(files['index.ts']).toBeDefined();
    expect(files['importmap.json']).toBeDefined();
    expect(files['styles.css']).toBeUndefined();
  });

  it('should add layout styles CSS when name includes layout examples', () => {
    const files = createDefaultFiles('<nve-button></nve-button>', elements, {
      name: '@nvidia-elements/styles/layout.examples.json'
    });
    expect(files['styles.css']).toBeDefined();
    expect(files['styles.css'].content).toContain('Layout example styles');
    expect(files['styles.css'].content).toContain('min-height: 220px');
  });

  it('should add responsive styles CSS when name includes responsive examples', () => {
    const files = createDefaultFiles('<nve-button></nve-button>', elements, {
      name: '@nvidia-elements/styles/responsive.examples.json'
    });
    expect(files['styles.css']).toBeDefined();
    expect(files['styles.css'].content).toContain('Responsive example styles');
    expect(files['styles.css'].content).toContain('min-width: 120px');
  });

  it('should add empty styles CSS when name includes responsive-patterns examples', () => {
    const files = createDefaultFiles('<nve-button></nve-button>', elements, {
      name: '@nvidia-elements/styles/responsive-patterns.examples.json'
    });
    expect(files['styles.css']).toBeDefined();
    expect(files['styles.css'].content).toBe('');
  });
});

describe('formatTemplate', () => {
  it('should remove nve-theme attributes from source', () => {
    const source = '<div nve-theme="dark">Content</div>';
    const result = formatTemplate(source);
    expect(result).not.toContain('nve-theme="dark"');
    expect(result).toContain('Content');
  });

  it('should remove multiple nve-theme attributes', () => {
    const source = '<div nve-theme="light" nve-theme="dark">Content</div>';
    const result = formatTemplate(source);
    expect(result).not.toContain('nve-theme="light"');
    expect(result).not.toContain('nve-theme="dark"');
  });

  it('should remove nve-theme="root" attribute', () => {
    const source = '<div nve-theme="root">Content</div>';
    const result = formatTemplate(source);
    expect(result).not.toContain('nve-theme="root"');
  });

  it('should preserve other attributes and content', () => {
    const source = '<div class="test" nve-theme="dark" id="main">Content</div>';
    const result = formatTemplate(source);
    expect(result).toContain('class="test"');
    expect(result).toContain('id="main"');
    expect(result).toContain('Content');
    expect(result).not.toContain('nve-theme="dark"');
  });
});

describe('playgroundTypes', () => {
  it('should contain all expected playground types', () => {
    expect(playgroundTypes).toEqual(['default', 'react', 'preact', 'angular', 'lit', 'vue']);
  });

  it('should have correct type definition', () => {
    const validTypes = ['default', 'react', 'preact', 'angular', 'lit'];
    validTypes.forEach(type => {
      expect(playgroundTypes).toContain(type);
    });
  });
});

describe('createPlaygroundURL with additional options', () => {
  const elements: ProjectElement[] = [
    {
      name: 'nve-button',
      markdown: ' ### Import ',
      manifest: { metadata: { entrypoint: '@nvidia-elements/core/button' } }
    }
  ] as ProjectElement[];

  it('should handle trustedContent option', () => {
    const result = createPlaygroundURL('nve-button', elements, { trustedContent: true });
    expectURL(result, '?version=1&layout=vertical-split&file=index.html&files=');
  });

  it('should handle custom openFile option for default type', () => {
    const result = createPlaygroundURL('nve-button', elements, { openFile: 'custom.html' });
    expectURL(result, '&file=custom.html&');
  });

  it('should handle custom openFile option for React type', () => {
    const result = createPlaygroundURL('nve-button', elements, {
      type: 'react',
      openFile: 'custom.tsx'
    });
    // React type overrides openFile to 'index.tsx', so we test that behavior
    expectURL(result, '&file=index.tsx&');
  });

  it('should handle empty name option', () => {
    const result = createPlaygroundURL('nve-button', elements, { name: '' });
    expect(result.includes('&name=&')).toBe(false); // Should not add name parameter for empty string
  });

  it('should handle whitespace in name option', () => {
    const result = createPlaygroundURL('nve-button', elements, { name: '  test name  ' });
    expectURL(result, '&name=test%20name&');
  });

  it('should handle special characters in name option', () => {
    const result = createPlaygroundURL('nve-button', elements, { name: 'test@name#123' });
    expectURL(result, '&name=test@name#123&');
  });
});

describe('createIndexHTML behavior', () => {
  const elements: ProjectElement[] = [
    {
      name: 'nve-button',
      markdown: ' ### Import ',
      manifest: { metadata: { entrypoint: '@nvidia-elements/core/button' } }
    }
  ] as ProjectElement[];

  it('should include layout styles when name contains layout examples', () => {
    const files = createDefaultFiles('<nve-button></nve-button>', elements, {
      name: '@nvidia-elements/styles/layout.examples.json'
    });
    const htmlContent = files['index.html'].content;
    expect(htmlContent).toContain('@nvidia-elements/styles/dist/labs/layout-viewport.css');
    expect(htmlContent).toContain('@nvidia-elements/styles/dist/labs/layout-container.css');
    expect(htmlContent).toContain('./styles.css');
  });

  it('should include layout styles when name contains responsive examples', () => {
    const files = createDefaultFiles('<nve-button></nve-button>', elements, {
      name: '@nvidia-elements/styles/responsive.examples.json'
    });
    const htmlContent = files['index.html'].content;
    expect(htmlContent).toContain('@nvidia-elements/styles/dist/labs/layout-viewport.css');
    expect(htmlContent).toContain('@nvidia-elements/styles/dist/labs/layout-container.css');
    expect(htmlContent).toContain('./styles.css');
  });

  it('should include layout styles when name contains responsive-patterns examples', () => {
    const files = createDefaultFiles('<nve-button></nve-button>', elements, {
      name: '@nvidia-elements/styles/responsive-patterns.examples.json'
    });
    const htmlContent = files['index.html'].content;
    expect(htmlContent).toContain('@nvidia-elements/styles/dist/labs/layout-viewport.css');
    expect(htmlContent).toContain('@nvidia-elements/styles/dist/labs/layout-container.css');
    expect(htmlContent).toContain('./styles.css');
  });

  it('should not include layout styles when name does not contain examples patterns', () => {
    const files = createDefaultFiles('<nve-button></nve-button>', elements, {
      name: 'regular-name'
    });
    const htmlContent = files['index.html'].content;
    expect(htmlContent).not.toContain('@nvidia-elements/styles/dist/labs/layout-viewport.css');
    expect(htmlContent).not.toContain('@nvidia-elements/styles/dist/labs/layout-container.css');
    expect(htmlContent).not.toContain('./styles.css');
  });

  it('should set nve-layout="pad:md" when content does not contain nve-page', () => {
    const files = createDefaultFiles('<nve-button></nve-button>', elements, {});
    const htmlContent = files['index.html'].content;
    expect(htmlContent).toContain('nve-layout="pad:md"');
  });

  it('should not set nve-layout="pad:md" when content contains nve-page', () => {
    const files = createDefaultFiles('<nve-page></nve-page>', elements, {});
    const htmlContent = files['index.html'].content;
    expect(htmlContent).not.toContain('nve-layout="pad:md"');
  });
});

describe('createImportMap with different frameworks', () => {
  const elements: ProjectElement[] = [
    {
      name: 'nve-button',
      markdown: ' ### Import ',
      manifest: { metadata: { entrypoint: '@nvidia-elements/core/button' } }
    }
  ] as ProjectElement[];

  it('should include React dependencies for React framework', () => {
    const files = createReactFiles('<nve-button></nve-button>', elements, {});
    const importmap = JSON.parse(files['importmap.json'].content);
    expect(importmap.imports['react']).toContain('/react@19');
    expect(importmap.imports['react-dom']).toContain('/react-dom@19');
  });

  it('should include Preact dependencies for Preact framework', () => {
    const files = createPreactFiles('<nve-button></nve-button>', elements, {});
    const importmap = JSON.parse(files['importmap.json'].content);
    expect(importmap.imports['preact']).toContain('/preact@10');
  });

  it('should include Angular dependencies for Angular framework', () => {
    const files = createAngularFiles('<nve-button></nve-button>', elements, {});
    const importmap = JSON.parse(files['importmap.json'].content);
    expect(importmap.imports['@angular/core']).toContain('/@angular/core@20.0.0');
    expect(importmap.imports['zone.js']).toContain('/zone.js');
  });

  it('should include Lit dependencies for Lit framework', () => {
    const files = createLitFiles('<nve-button></nve-button>', elements, {});
    const importmap = JSON.parse(files['importmap.json'].content);
    expect(importmap.imports['lit']).toContain('/lit@latest');
  });

  it('should include Vue dependencies for Vue framework', () => {
    const files = createVueFiles('<nve-button></nve-button>', elements, {});
    const importmap = JSON.parse(files['importmap.json'].content);
    expect(importmap.imports['vue']).toContain('/vue@3');
    expect(importmap.imports['vue/']).toContain('/vue@3/');
  });

  it('should include all NVE packages for all frameworks', () => {
    const files = createDefaultFiles('<nve-button></nve-button>', elements, {});
    const importmap = JSON.parse(files['importmap.json'].content);
    expect(importmap.imports['@nvidia-elements/core']).toContain('/@nvidia-elements/core@latest');
    expect(importmap.imports['@nvidia-elements/styles']).toContain('/@nvidia-elements/styles@latest');
    expect(importmap.imports['@nvidia-elements/themes']).toContain('/@nvidia-elements/themes@latest');
    expect(importmap.imports['@nvidia-elements/monaco']).toContain('/@nvidia-elements/monaco@latest');
    expect(importmap.imports['@nvidia-elements/code']).toContain('/@nvidia-elements/code@latest');
    expect(importmap.imports['@nvidia-elements/forms']).toContain('/@nvidia-elements/forms@latest');
  });
});

describe('serialize function behavior', () => {
  it('should compress and encode data by default', () => {
    // The serialize function is called internally, so we test its effect
    const result = createPlaygroundURL('<nve-button></nve-button>', [], {});

    if (hasPlaygroundBaseURL) {
      // Should contain encoded files data
      expect(result).toContain('&files=');
      expect(result.length).toBeGreaterThan(100); // Should be reasonably long due to compression
    } else {
      expect(result).toBe('');
    }
  });
});

describe('Edge cases and error handling', () => {
  const elements: ProjectElement[] = [];

  it('should handle empty content string', () => {
    const result = createPlaygroundURL('', elements);
    expectURL(result, '?version=1&layout=vertical-split&file=index.html&files=');
  });

  it('should handle content with only whitespace', () => {
    const result = createPlaygroundURL('   ', elements);
    expectURL(result, '?version=1&layout=vertical-split&file=index.html&files=');
  });

  it('should handle undefined options', () => {
    const result = createPlaygroundURL('<nve-button></nve-button>', elements);
    expectURL(result, '?version=1&layout=vertical-split&file=index.html&files=');
  });

  it('should handle options with empty string values', () => {
    const result = createPlaygroundURL('<nve-button></nve-button>', elements, {
      name: '',
      theme: '',
      referer: ''
    });
    expectURL(result, '?version=1&layout=vertical-split&file=index.html&files=');
    // Empty strings should not add parameters
    expect(result.includes('&name=&')).toBe(false);
    expect(result.includes('&theme=&')).toBe(false);
    expect(result.includes('&ref=&')).toBe(false);
  });

  it('should treat name "undefined" as empty string', () => {
    const result = createPlaygroundURL('<nve-button></nve-button>', elements, { name: 'undefined' });
    expect(result.includes('&name=undefined')).toBe(false);
  });
});

describe('createIndexHTML theme handling', () => {
  const elements: ProjectElement[] = [
    {
      name: 'nve-button',
      markdown: ' ### Import ',
      manifest: { metadata: { entrypoint: '@nvidia-elements/core/button' } }
    }
  ] as ProjectElement[];

  it('should set nve-theme attribute from options', () => {
    const files = createDefaultFiles('<nve-button></nve-button>', elements, { theme: 'dark' });
    expect(files['index.html'].content).toContain('nve-theme="dark"');
  });

  it('should set empty nve-theme when no theme provided', () => {
    const files = createDefaultFiles('<nve-button></nve-button>', elements, {});
    expect(files['index.html'].content).toContain('nve-theme=""');
  });
});

describe('framework file content details', () => {
  const elements: ProjectElement[] = [
    {
      name: 'nve-button',
      markdown: ' ### Import ',
      manifest: { metadata: { entrypoint: '@nvidia-elements/core/button' } }
    }
  ] as ProjectElement[];

  it('should include CUSTOM_ELEMENTS_SCHEMA in Angular files', () => {
    const files = createAngularFiles('<nve-button></nve-button>', elements, {});
    expect(files['index.ts'].content).toContain('CUSTOM_ELEMENTS_SCHEMA');
    expect(files['index.ts'].content).toContain("selector: 'app-root'");
    expect(files['index.ts'].content).toContain('bootstrapApplication(App)');
  });

  it('should include @customElement decorator in Lit files', () => {
    const files = createLitFiles('<nve-button></nve-button>', elements, {});
    expect(files['index.ts'].content).toContain("@customElement('app-root')");
    expect(files['index.ts'].content).toContain('extends LitElement');
  });

  it('should include createRoot in React files', () => {
    const files = createReactFiles('<nve-button></nve-button>', elements, {});
    expect(files['index.tsx'].content).toContain("createRoot(document.getElementById('root'))");
    expect(files['index.tsx'].content).toContain('root.render(<App />)');
  });

  it('should include render call in Preact files', () => {
    const files = createPreactFiles('<nve-button></nve-button>', elements, {});
    expect(files['index.tsx'].content).toContain("render(<App />, document.getElementById('root'))");
    expect(files['index.tsx'].content).toContain('/** @jsxImportSource preact */');
  });

  it('should include reactive state setup in Vue files', () => {
    const files = createVueFiles('<nve-button></nve-button>', elements, {});
    expect(files['index.ts'].content).toContain('count: ref(0)');
    expect(files['index.ts'].content).toContain('setup()');
  });
});
