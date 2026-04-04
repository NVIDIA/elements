// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type { Element } from '@internals/metadata';

export type ELEMENTS_ENV = 'mcp' | 'cli' | 'browser' | 'docs';

export const markdownDescription = `Format of output. Use 'json' ONLY when you need to programmatically process the data. For reading/understanding, use   
  the default 'markdown' format which is more readable and uses fewer tokens.`;

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
        const path = `${element.manifest!.metadata.entrypoint}/define.js`;
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

  return Array.from(new Set([...IMPORTS, ...ELEMENTS_CODE_IMPORTS]));
}

export function wrapText(text = '', width = 80) {
  return text
    .split('\n')
    .map(line => {
      if (line.length <= width) return line;

      const lines: string[] = [];
      let currentLine = '';

      for (const word of line.split(' ')) {
        if (currentLine.length + word.length + 1 <= width) {
          currentLine += (currentLine ? ' ' : '') + word;
        } else {
          if (currentLine) {
            lines.push(currentLine);
            currentLine = word;
          } else {
            lines.push(word);
          }
        }
      }

      if (currentLine) {
        lines.push(currentLine);
      }

      return lines.join('\n');
    })
    .join('\n');
}
