import { afterAll, describe, expect, it, vi } from 'vitest';
import { htmlMinifyTransform } from './html-minify.js';

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
