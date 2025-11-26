import type { Element } from '@internals/metadata';

export type ELEMENTS_ENV = 'mcp' | 'cli' | 'browser' | 'docs';

export const ELEMENTS_ENV_ICON = {
  mcp: '🤖',
  cli: '💻',
  browser: '🌐',
  docs: '📖'
} as const;

export function getAvailableElementTags(elements: Element[]) {
  return elements.filter(e => e.manifest?.deprecated !== 'true').map(e => e.name);
}

export function getElementImports(html: string, elements: Element[], lazy = false) {
  const IMPORTS = [
    ...elements
      .filter(element => html?.includes(`<${element.name}`))
      .filter(element => element.manifest?.deprecated !== 'true' && element.manifest?.metadata.entrypoint)
      .map(element => {
        const path = `${element.manifest.metadata.entrypoint}/define.js`;
        return lazy ? `import('${path}');` : `import '${path}';`;
      })
  ];

  const ELEMENTS_CODE_IMPORTS = html.includes('nve-codeblock')
    ? [
        `import '@nvidia-elements/code/codeblock/languages/html.js';`,
        `import '@nvidia-elements/code/codeblock/languages/css.js';`,
        `import '@nvidia-elements/code/codeblock/languages/json.js';`,
        `import '@nvidia-elements/code/codeblock/languages/javascript.js';`,
        `import '@nvidia-elements/code/codeblock/languages/typescript.js';`,
        `import '@nvidia-elements/code/codeblock/define.js';`
      ]
    : [];

  return [...IMPORTS, ...ELEMENTS_CODE_IMPORTS];
}
