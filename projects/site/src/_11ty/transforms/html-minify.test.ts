import { afterAll, describe, expect, it, vi } from 'vitest';
import { parseFragment, type DefaultTreeAdapterMap } from 'parse5';
import markdown from '../libraries/markdown.js';
import { htmlMinifyTransform } from './html-minify.js';

const authoredContent =
  '\n\n  first line\n\n    indented line\n\n# heading\n- list\n```typescript\n  const answer = 42;\n```\n**bold** &amp; &lt;tag&gt; &#10;\n\n';
// HTML consumes the first leading LF and decodes character references in textarea values.
const expectedValue =
  '\n  first line\n\n    indented line\n\n# heading\n- list\n```typescript\n  const answer = 42;\n```\n**bold** & <tag> \n\n\n';
const textarea = `<textarea aria-label="Message">${authoredContent}</textarea>`;
const exampleSource = `<div>${textarea}<textarea aria-label="Second">  second\n\n</textarea></div>`;

function textOfTags(html: string, tag: string): string[] {
  const values: string[] = [];
  function text(node: DefaultTreeAdapterMap['node']): string {
    if ('value' in node) return node.value;
    return 'childNodes' in node ? node.childNodes.map(text).join('') : '';
  }
  function visit(node: DefaultTreeAdapterMap['node']) {
    if ('tagName' in node && node.tagName === tag) values.push(text(node));
    if ('childNodes' in node) node.childNodes.forEach(visit);
  }
  visit(parseFragment(html));
  return values;
}

vi.stubEnv('ELEVENTY_RUN_MODE', 'build');

afterAll(() => {
  vi.unstubAllEnvs();
});

describe('htmlMinifyTransform', () => {
  it('should minify html output', async () => {
    const html = '<!doctype html>\n<html lang="en">\n  <body>Updates</body>\n</html>';
    const result = await htmlMinifyTransform.call({ page: {} }, html, '/index.html');

    expect(result).not.toBe(html);
    expect(result).not.toContain('\n');
    expect(result).toContain('<html lang=en>');
  });

  it('should preserve authored template content before script cleanup and minification', async () => {
    const content = '<script type="module">\n\nconst value = 1;\n\n</script><textarea>\n\n&amp;\n</textarea>';
    const html = `<div class="ordinary" >  text   content </div><template id="sample">${content}</template>`;
    const result = await htmlMinifyTransform.call({ page: {} }, html, '/index.html');

    expect(result).toContain(`<template id=sample>${content}</template>`);
    expect(result).toContain('<div class=ordinary> text content </div>');
  });

  it('preserves complete nested templates and keeps following content outside them', async () => {
    const content = '<template id="inner">\n  <span>nested</span>\n</template>\n<p>outer tail</p>';
    const html = `<template id="outer">${content}</template><p id="after">  following   content </p>`;
    const result = await htmlMinifyTransform.call({ page: {} }, html, '/index.html');

    expect(result).toContain(`<template id=outer>${content}</template>`);
    expect(result).toContain('<p id=after> following content </p>');
    expect(parseFragment(result).childNodes).toMatchObject([
      { tagName: 'template' },
      { tagName: 'p', attrs: [{ name: 'id', value: 'after' }] }
    ]);
  });

  it('preserves native textarea values and source during production minification', async () => {
    vi.stubEnv('ELEVENTY_RUN_MODE', 'build');
    const source = markdown.utils.escapeHtml(exampleSource);
    const html = `<div class="ordinary" >  ordinary   text </div>${exampleSource}<pre><code>${source}</code></pre>`;
    const result = await htmlMinifyTransform.call({ page: {} }, html, '/index.html');
    expect(textOfTags(result, 'textarea')).toEqual([expectedValue, '  second\n\n']);
    expect(textOfTags(result, 'code')).toEqual([exampleSource]);
    expect(result).toContain('class=ordinary');
    expect(result).not.toContain('ordinary   text');
  });

  it.each([
    ['\n# heading\n\n**bold**\n', '# heading\n\n**bold**\n'],
    ['<script type="module">\n\ntext\n\n</script>', '<script type="module">\n\ntext\n\n</script>'],
    ['&#10;\n&amp;lt;tag&amp;gt;\n', '\n&lt;tag&gt;\n'],
    ['\n\n', '\n'],
    ['', '']
  ])('preserves textarea content %j during minification', async (content, value) => {
    vi.stubEnv('ELEVENTY_RUN_MODE', 'build');
    const html = `<textarea>${content}</textarea>`;
    const result = await htmlMinifyTransform.call({ page: {} }, html, '/index.html');
    expect(result).toContain(html);
    expect(textOfTags(result, 'textarea')).toEqual([value]);
  });

  it('should preserve XML output', async () => {
    const xml = '<?xml version="1.0" encoding="utf-8"?>\n<feed xmlns="http://www.w3.org/2005/Atom"></feed>';

    await expect(htmlMinifyTransform.call({ page: {} }, xml, '/atom.xml')).resolves.toBe(xml);
  });

  it('should preserve safely encoded JSON-LD contents', async () => {
    const structuredData = {
      '@context': 'https://schema.org',
      '@type': 'SoftwareSourceCode',
      text: '<script type="module">console.log("ready");</script>'
    };
    const jsonLd = JSON.stringify(structuredData).replaceAll('<', '\\u003c');
    const html = `<!doctype html><html><body><script type="application/ld+json">${jsonLd}</script></body></html>`;
    const result = await htmlMinifyTransform.call({ page: {} }, html, '/index.html');
    const script = result.match(/<script type=application\/ld\+json>([\s\S]*?)<\/script>/);

    expect(script?.[1]).toContain('\\u003c/script>');
    expect(JSON.parse(script?.[1] ?? '{}')).toEqual(structuredData);
  });

  it('should not replace ordinary text that resembles a protection marker', async () => {
    const html = `<!doctype html><html><body>
      <p>__TEMPLATE_0__ __JSON_LD_1__</p>
      <template><span>Template content</span></template>
      <script type="application/ld+json">{"@context":"https://schema.org"}</script>
    </body></html>`;
    const result = await htmlMinifyTransform.call({ page: {} }, html, '/index.html');

    expect(result).toContain('__TEMPLATE_0__ __JSON_LD_1__');
    expect(result).toContain('<template><span>Template content</span></template>');
    expect(result).toContain('{"@context":"https://schema.org"}');
  });
});
