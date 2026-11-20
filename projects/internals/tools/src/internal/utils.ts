// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type { Element } from '@internals/metadata';

export const markdownDescription = `Format of output. Use 'json' ONLY when you need to programmatically process the data. For reading/understanding, use   
  the default 'markdown' format which is more readable and uses fewer tokens.`;

export const ELEMENTS_ENV_ICON = {
  mcp: '🤖',
  cli: '💻',
  browser: '🌐',
  docs: '📖'
} as const;

// The max agent MCP response size limit is 25,000 tokens (~100,000 characters).
// Use a buffer to avoid unpredictable model behavior or response failure.
export const MAX_CONTEXT_CHARS = 60_000;

export const MAX_CONTEXT_TOKENS = 15_000;

export function isDebug() {
  return process.env.ELEMENTS_DEBUG === 'true' && process.env.ELEMENTS_ENV !== 'mcp';
}

export function getAvailableElementTags(elements: Element[]) {
  return elements.filter(e => e.manifest?.deprecated !== 'true').map(e => e.name);
}

export function getElementImports(html: string, elements: Element[], lazy = false) {
  const elementTags = new Set(Array.from(html.matchAll(/<([a-z][\w.-]*-[\w.-]+)/g), match => match[1]));
  const IMPORTS = [
    ...elements
      .filter(element => elementTags.has(element.name))
      .filter(element => element.manifest?.deprecated !== 'true' && element.manifest?.metadata.entrypoint)
      .map(element => {
        const path = `${element.manifest!.metadata.entrypoint}/define.js`;
        return lazy ? `import('${path}');` : `import '${path}';`;
      })
  ];

  const ELEMENTS_CODE_IMPORTS =
    elementTags.has('nve-code-block') || elementTags.has('nve-codeblock')
      ? [`import '@nvidia-elements/code/code-block/define.js';`]
      : [];

  return Array.from(new Set([...getCodeLanguageImports(html), ...IMPORTS, ...ELEMENTS_CODE_IMPORTS]));
}

function getCodeLanguageImports(html: string) {
  const imports = new Set<string>();
  const codeTags = /<nve-(?:code-?block|code-textarea)(?=[\s/>])((?:[^<>"']|"[^"]*"|'[^']*')*)>/g;
  for (const [, attributes = ''] of html.matchAll(codeTags)) {
    const language = findCodeLanguageAttribute(attributes)?.toLowerCase();
    if (/^(?:css|go|html|javascript|json|markdown|python|tsx|typescript|xml|yaml)$/.test(language ?? '')) {
      imports.add(`import '@nvidia-elements/code/languages/${language}.js';`);
    }
  }
  return [...imports];
}

function findCodeLanguageAttribute(attributes: string) {
  const attribute = /(?:^|\s)([^\s"'<>/=]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+)))?/g;
  for (const [, name, doubleQuoted, singleQuoted, unquoted] of attributes.matchAll(attribute)) {
    if (name?.toLowerCase() === 'language') return doubleQuoted ?? singleQuoted ?? unquoted;
  }
  return undefined;
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
