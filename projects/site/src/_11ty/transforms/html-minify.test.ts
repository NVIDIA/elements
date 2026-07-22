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
});
