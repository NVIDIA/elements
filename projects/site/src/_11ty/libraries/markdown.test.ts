import { describe, expect, it } from 'vitest';
import { getElementImports } from '@internals/tools';
import markdown from './markdown.js';

describe('Markdown fence rendering and language imports', () => {
  it.each([
    ['javascript', 'javascript'],
    ['js', 'javascript'],
    ['JS', 'javascript'],
    ['md', 'markdown'],
    ['ts', 'typescript'],
    ['py', 'python'],
    ['yml', 'yaml']
  ])('renders the %s fence and generates the %s language import', (fence, language) => {
    const rendered = markdown.render(`~~~${fence}\nexample\n~~~`);

    expect(rendered).toContain(`<nve-code-block language="${language}">`);
    expect(getElementImports(rendered, [])).toContain(`import '@nvidia-elements/code/languages/${language}.js';`);
  });

  it.each(['bash', 'shell', 'toml'])('renders %s fences as plain text without a parser import', fence => {
    const rendered = markdown.render(`~~~${fence}\nexample\n~~~`);

    expect(rendered).toContain('<nve-code-block language="text">');
    expect(getElementImports(rendered, []).some(statement => statement.includes('/languages/'))).toBe(false);
  });
});
