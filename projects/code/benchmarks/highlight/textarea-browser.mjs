// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';
import { createServer } from 'vite';

/** Uses built consumer entrypoints, with an optional installed browser channel. */
export async function codeTextareaBrowser(options = {}) {
  const server = await createServer({
    configFile: false,
    logLevel: 'error',
    root: fileURLToPath(new URL('../../', import.meta.url)),
    optimizeDeps: { noDiscovery: true },
    plugins: [
      {
        name: 'native-textarea-probe',
        configureServer(vite) {
          vite.middlewares.use((request, response, next) => {
            if (request.url !== '/textarea-probe.html') return next();
            response.setHeader('Content-Type', 'text/html');
            response.end(
              '<!doctype html><html lang="en" nve-theme="light"><head><title>Native code textarea</title></head><body></body></html>'
            );
          });
        }
      }
    ],
    server: { host: '127.0.0.1', port: 0, hmr: false, ws: false }
  });
  let browser;
  try {
    await server.listen();
    browser = await chromium.launch({
      channel: options.channel === 'bundled' ? undefined : (options.channel ?? process.env.NVE_TEST_BROWSER_CHANNEL),
      args: options.experimental === false ? [] : ['--enable-blink-features=OpaqueRange']
    });
    return {
      browser,
      version: browser.version(),
      async page() {
        const page = await browser.newPage();
        await page.goto(new URL('textarea-probe.html', server.resolvedUrls.local[0]).href);
        await page.evaluate(
          async imports => {
            for (const path of imports) await import(path);
            await import('/dist/code-textarea/define.js');
            await import('/dist/codeblock/define.js');
            for (const language of ['json', 'typescript', 'tsx', 'markdown', 'python'])
              await import(`/dist/codeblock/languages/${language}.js`);
            const { categories } = await import('/dist/internal/highlight/categories.js');
            const { getScanner } = await import('/dist/internal/highlight/language-registry.js');
            window.textareaProbe = {
              scan: (text, language) => getScanner(language)(text),
              ranges: () =>
                [...CSS.highlights]
                  .flatMap(([name, group]) =>
                    [...group]
                      .filter(range => 'disconnect' in range)
                      .map(range => [range.startOffset, range.endOffset, categories.indexOf(name.slice(9))])
                  )
                  .sort((a, b) => a[0] - b[0] || a[1] - b[1])
            };
          },
          [
            '@nvidia-elements/themes/index.css',
            '@nvidia-elements/themes/dark.css',
            '@nvidia-elements/core/textarea/define.js'
          ].map(specifier => `/@fs${fileURLToPath(import.meta.resolve(specifier))}`)
        );
        return page;
      },
      async close() {
        await browser.close();
        await server.close();
      }
    };
  } catch (error) {
    await browser?.close();
    await server.close();
    throw error;
  }
}

export async function textareaFixture(
  page,
  { language = 'typescript', text = 'const initial = 1;', plain = false } = {}
) {
  return page.evaluate(
    async ({ language, text, plain }) => {
      const begin = performance.now();
      const form = document.createElement('form');
      const element = document.createElement(plain ? 'nve-textarea' : 'nve-code-textarea');
      if (!plain) element.language = language;
      const label = document.createElement('label');
      label.textContent = 'Source code';
      const textarea = document.createElement('textarea');
      textarea.name = 'source';
      textarea.rows = 8;
      textarea.spellcheck = false;
      textarea.defaultValue = text;
      element.append(label, textarea);
      form.append(element);
      document.body.append(form);
      element.style.width = '600px';
      await element.updateComplete;
      const registrationMs = performance.now() - begin;
      await document.fonts.ready;
      await new Promise(resolve => requestAnimationFrame(resolve));
      window.textareaFixture = { element, textarea, form };
      return { value: textarea.value, api: typeof textarea.createValueRange === 'function', registrationMs };
    },
    { language, text, plain }
  );
}
