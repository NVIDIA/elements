import { describe, it, expect } from 'vitest';
import type { MetadataSummary } from '@internals/metadata';
import {
  createPlaygroundURL,
  createAngularFiles,
  createLitFiles,
  createReactFiles,
  createPreactFiles,
  createDefaultFiles,
  formatTemplate,
  playgroundTypes
} from './utils.js';

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
      },
      '@nvidia-elements/code': {
        elements: [
          {
            name: 'nve-code',
            manifest: { metadata: { entrypoint: '@nvidia-elements/code/codeblock', markdown: ' ### Import ' } }
          }
        ]
      },
      '@nvidia-elements/markdown': {
        elements: [
          {
            name: 'nve-markdown',
            manifest: { metadata: { entrypoint: '@nvidia-elements/markdown/markdown', markdown: ' ### Import ' } }
          }
        ]
      }
    }
  } as unknown as MetadataSummary;

  it('should create a playground URL', () => {
    const result = createPlaygroundURL('nve-button', metadata);
    expect(result.includes('?version=1&layout=vertical-split&file=index.html&files=')).toBe(true);
  });

  it('should create a playground URL with a custom name', () => {
    const result = createPlaygroundURL('nve-button', metadata, { name: 'nve-button' });
    expect(result.includes('?version=1&layout=vertical-split&name=nve-button&file=index.html&files=')).toBe(true);
  });

  it('should create a playground URL with a theme', () => {
    const result = createPlaygroundURL('nve-button', metadata, { theme: 'light' });
    expect(result.includes('?version=1&layout=vertical-split&theme=light&file=index.html&files=')).toBe(true);
  });

  it('should create a playground URL with a referer', () => {
    const result = createPlaygroundURL('nve-button', metadata, {
      referer: 'https://www.nvidia.com'
    });
    expect(result.includes('?version=1&layout=vertical-split&file=index.html&ref=https://www.nvidia.com&files=')).toBe(
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
    const result = createPlaygroundURL('nve-button', metadata, { type: 'react' });
    expect(result.includes('?version=1&layout=vertical-split&name=react&file=index.tsx&files=')).toBe(true);
  });

  it('should create a React playground URL with a custom name', () => {
    const result = createPlaygroundURL('nve-button', metadata, { name: 'nve-button', type: 'react' });
    expect(result.includes('?version=1&layout=vertical-split&name=react%20nve-button&file=index.tsx&files=')).toBe(
      true
    );
  });

  it('should create a React playground URL with a referer', () => {
    const result = createPlaygroundURL('nve-button', metadata, {
      type: 'react',
      name: 'nve-button',
      referer: 'https://www.nvidia.com'
    });
    expect(
      result.includes(
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
    const result = createPlaygroundURL('nve-button', metadata, { type: 'preact' });
    expect(result.includes('?version=1&layout=vertical-split&name=preact&file=index.tsx&files=')).toBe(true);
  });

  it('should create a Preact playground URL with a custom name', () => {
    const result = createPlaygroundURL('nve-button', metadata, { name: 'nve-button', type: 'preact' });
    expect(result.includes('?version=1&layout=vertical-split&name=preact%20nve-button&file=index.tsx&files=')).toBe(
      true
    );
  });

  it('should create a Preact playground URL with a referer', () => {
    const result = createPlaygroundURL('nve-button', metadata, {
      name: 'nve-button',
      type: 'preact',
      referer: 'https://www.nvidia.com'
    });
    expect(
      result.includes(
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
    const result = createPlaygroundURL('nve-button', metadata, { type: 'angular' });
    expect(result.includes('?version=1&layout=vertical-split&name=angular&file=index.ts&files=')).toBe(true);
  });

  it('should create a Angular playground URL with a custom name', () => {
    const result = createPlaygroundURL('nve-button', metadata, { name: 'nve-button', type: 'angular' });
    expect(result.includes('?version=1&layout=vertical-split&name=angular%20nve-button&file=index.ts&files=')).toBe(
      true
    );
  });

  it('should create a Angular playground URL with a referer', () => {
    const result = createPlaygroundURL('nve-button', metadata, {
      name: 'nve-button',
      type: 'angular',
      referer: 'https://www.nvidia.com'
    });
    expect(
      result.includes(
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
    const result = createPlaygroundURL('nve-button', metadata, { type: 'lit' });
    expect(result.includes('?version=1&layout=vertical-split&name=lit&file=index.ts&files=')).toBe(true);
  });

  it('should create a Lit playground URL with a custom name', () => {
    const result = createPlaygroundURL('nve-button', metadata, { name: 'nve-button', type: 'lit' });
    expect(result.includes('?version=1&layout=vertical-split&name=lit%20nve-button&file=index.ts&files=')).toBe(true);
  });

  it('should create a Lit playground URL with a referer', () => {
    const result = createPlaygroundURL('nve-button', metadata, {
      name: 'nve-button',
      type: 'lit',
      referer: 'https://www.nvidia.com'
    });
    expect(
      result.includes(
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

describe('createDefaultFiles', () => {
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
      }
    }
  } as unknown as MetadataSummary;

  it('should create default files with basic structure', () => {
    const files = createDefaultFiles('<nve-button></nve-button>', metadata, {});
    expect(files['index.html']).toBeDefined();
    expect(files['index.ts']).toBeDefined();
    expect(files['importmap.json']).toBeDefined();
    expect(files['styles.css']).toBeUndefined();
  });

  it('should add layout styles CSS when name includes layout stories', () => {
    const files = createDefaultFiles('<nve-button></nve-button>', metadata, {
      name: '@nvidia-elements/styles/layout.stories.json'
    });
    expect(files['styles.css']).toBeDefined();
    expect(files['styles.css'].content).toContain('Layout example styles');
    expect(files['styles.css'].content).toContain('min-height: 220px');
  });

  it('should add responsive styles CSS when name includes responsive stories', () => {
    const files = createDefaultFiles('<nve-button></nve-button>', metadata, {
      name: '@nvidia-elements/styles/responsive.stories.json'
    });
    expect(files['styles.css']).toBeDefined();
    expect(files['styles.css'].content).toContain('Responsive example styles');
    expect(files['styles.css'].content).toContain('min-width: 120px');
  });

  it('should add empty styles CSS when name includes responsive-patterns stories', () => {
    const files = createDefaultFiles('<nve-button></nve-button>', metadata, {
      name: '@nvidia-elements/styles/responsive-patterns.stories.json'
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
    expect(playgroundTypes).toEqual(['default', 'react', 'preact', 'angular', 'lit']);
  });

  it('should have correct type definition', () => {
    const validTypes = ['default', 'react', 'preact', 'angular', 'lit'];
    validTypes.forEach(type => {
      expect(playgroundTypes).toContain(type);
    });
  });
});

describe('createPlaygroundURL with additional options', () => {
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
      }
    }
  } as unknown as MetadataSummary;

  it('should handle trustedContent option', () => {
    const result = createPlaygroundURL('nve-button', metadata, { trustedContent: true });
    expect(result.includes('?version=1&layout=vertical-split&file=index.html&files=')).toBe(true);
  });

  it('should handle custom openFile option for default type', () => {
    const result = createPlaygroundURL('nve-button', metadata, { openFile: 'custom.html' });
    expect(result.includes('&file=custom.html&')).toBe(true);
  });

  it('should handle custom openFile option for React type', () => {
    const result = createPlaygroundURL('nve-button', metadata, {
      type: 'react',
      openFile: 'custom.tsx'
    });
    // React type overrides openFile to 'index.tsx', so we test that behavior
    expect(result.includes('&file=index.tsx&')).toBe(true);
  });

  it('should handle empty name option', () => {
    const result = createPlaygroundURL('nve-button', metadata, { name: '' });
    expect(result.includes('&name=&')).toBe(false); // Should not add name parameter for empty string
  });

  it('should handle whitespace in name option', () => {
    const result = createPlaygroundURL('nve-button', metadata, { name: '  test name  ' });
    expect(result.includes('&name=test%20name&')).toBe(true);
  });

  it('should handle special characters in name option', () => {
    const result = createPlaygroundURL('nve-button', metadata, { name: 'test@name#123' });
    expect(result.includes('&name=test@name#123&')).toBe(true);
  });
});

describe('createIndexHTML behavior', () => {
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
      }
    }
  } as unknown as MetadataSummary;

  it('should include layout styles when name contains layout stories', () => {
    const files = createDefaultFiles('<nve-button></nve-button>', metadata, {
      name: '@nvidia-elements/styles/layout.stories.json'
    });
    const htmlContent = files['index.html'].content;
    expect(htmlContent).toContain('@nvidia-elements/styles/dist/labs/layout-viewport.css');
    expect(htmlContent).toContain('@nvidia-elements/styles/dist/labs/layout-container.css');
    expect(htmlContent).toContain('./styles.css');
  });

  it('should include layout styles when name contains responsive stories', () => {
    const files = createDefaultFiles('<nve-button></nve-button>', metadata, {
      name: '@nvidia-elements/styles/responsive.stories.json'
    });
    const htmlContent = files['index.html'].content;
    expect(htmlContent).toContain('@nvidia-elements/styles/dist/labs/layout-viewport.css');
    expect(htmlContent).toContain('@nvidia-elements/styles/dist/labs/layout-container.css');
    expect(htmlContent).toContain('./styles.css');
  });

  it('should include layout styles when name contains responsive-patterns stories', () => {
    const files = createDefaultFiles('<nve-button></nve-button>', metadata, {
      name: '@nvidia-elements/styles/responsive-patterns.stories.json'
    });
    const htmlContent = files['index.html'].content;
    expect(htmlContent).toContain('@nvidia-elements/styles/dist/labs/layout-viewport.css');
    expect(htmlContent).toContain('@nvidia-elements/styles/dist/labs/layout-container.css');
    expect(htmlContent).toContain('./styles.css');
  });

  it('should not include layout styles when name does not contain stories patterns', () => {
    const files = createDefaultFiles('<nve-button></nve-button>', metadata, {
      name: 'regular-name'
    });
    const htmlContent = files['index.html'].content;
    expect(htmlContent).not.toContain('@nvidia-elements/styles/dist/labs/layout-viewport.css');
    expect(htmlContent).not.toContain('@nvidia-elements/styles/dist/labs/layout-container.css');
    expect(htmlContent).not.toContain('./styles.css');
  });

  it('should set nve-layout="pad:md" when content does not contain nve-page', () => {
    const files = createDefaultFiles('<nve-button></nve-button>', metadata, {});
    const htmlContent = files['index.html'].content;
    expect(htmlContent).toContain('nve-layout="pad:md"');
  });

  it('should not set nve-layout="pad:md" when content contains nve-page', () => {
    const files = createDefaultFiles('<nve-page></nve-page>', metadata, {});
    const htmlContent = files['index.html'].content;
    expect(htmlContent).not.toContain('nve-layout="pad:md"');
  });
});

describe('createImportMap with different frameworks', () => {
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
      }
    }
  } as unknown as MetadataSummary;

  it('should include React dependencies for React framework', () => {
    const files = createReactFiles('<nve-button></nve-button>', metadata, {});
    const importmap = JSON.parse(files['importmap.json'].content);
    expect(importmap.imports['react']).toBe('https://esm.nvidia.com/react@19');
    expect(importmap.imports['react-dom']).toBe('https://esm.nvidia.com/react-dom@19');
  });

  it('should include Preact dependencies for Preact framework', () => {
    const files = createPreactFiles('<nve-button></nve-button>', metadata, {});
    const importmap = JSON.parse(files['importmap.json'].content);
    expect(importmap.imports['preact']).toBe('https://esm.nvidia.com/preact@10');
  });

  it('should include Angular dependencies for Angular framework', () => {
    const files = createAngularFiles('<nve-button></nve-button>', metadata, {});
    const importmap = JSON.parse(files['importmap.json'].content);
    expect(importmap.imports['@angular/core']).toBe('https://esm.nvidia.com/@angular/core@20.0.0');
    expect(importmap.imports['zone.js']).toBe('https://esm.nvidia.com/zone.js');
  });

  it('should include Lit dependencies for Lit framework', () => {
    const files = createLitFiles('<nve-button></nve-button>', metadata, {});
    const importmap = JSON.parse(files['importmap.json'].content);
    expect(importmap.imports['lit']).toBe('https://esm.nvidia.com/lit@latest');
  });

  it('should include all NVE packages for all frameworks', () => {
    const files = createDefaultFiles('<nve-button></nve-button>', metadata, {});
    const importmap = JSON.parse(files['importmap.json'].content);
    expect(importmap.imports['@nvidia-elements/core']).toBe('https://esm.nvidia.com/@nvidia-elements/core@latest');
    expect(importmap.imports['@nvidia-elements/styles']).toBe('https://esm.nvidia.com/@nvidia-elements/styles@latest');
    expect(importmap.imports['@nvidia-elements/themes']).toBe('https://esm.nvidia.com/@nvidia-elements/themes@latest');
    expect(importmap.imports['@nvidia-elements/monaco']).toBe('https://esm.nvidia.com/@nvidia-elements/monaco@latest');
    expect(importmap.imports['@nvidia-elements/code']).toBe('https://esm.nvidia.com/@nvidia-elements/code@latest');
    expect(importmap.imports['@nvidia-elements/forms']).toBe('https://esm.nvidia.com/@nvidia-elements/forms@latest');
  });
});

describe('serialize function behavior', () => {
  it('should compress and encode data by default', () => {
    // The serialize function is called internally, so we test its effect
    const result = createPlaygroundURL(
      '<nve-button></nve-button>',
      {
        created: '2021-01-01',
        projects: {}
      } as unknown as MetadataSummary,
      {}
    );

    // Should contain encoded files data
    expect(result).toContain('&files=');
    expect(result.length).toBeGreaterThan(100); // Should be reasonably long due to compression
  });
});

describe('Edge cases and error handling', () => {
  const metadata = {
    created: '2021-01-01',
    projects: {}
  } as unknown as MetadataSummary;

  it('should handle empty content string', () => {
    const result = createPlaygroundURL('', metadata);
    expect(result.includes('?version=1&layout=vertical-split&file=index.html&files=')).toBe(true);
  });

  it('should handle content with only whitespace', () => {
    const result = createPlaygroundURL('   ', metadata);
    expect(result.includes('?version=1&layout=vertical-split&file=index.html&files=')).toBe(true);
  });

  it('should handle undefined options', () => {
    const result = createPlaygroundURL('<nve-button></nve-button>', metadata);
    expect(result.includes('?version=1&layout=vertical-split&file=index.html&files=')).toBe(true);
  });

  it('should handle options with empty string values', () => {
    const result = createPlaygroundURL('<nve-button></nve-button>', metadata, {
      name: '',
      theme: '',
      referer: ''
    });
    expect(result.includes('?version=1&layout=vertical-split&file=index.html&files=')).toBe(true);
    // Empty strings should not add parameters
    expect(result.includes('&name=&')).toBe(false);
    expect(result.includes('&theme=&')).toBe(false);
    expect(result.includes('&ref=&')).toBe(false);
  });
});
