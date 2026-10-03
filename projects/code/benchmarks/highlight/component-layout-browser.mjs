// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { join } from 'node:path';
import { chromium } from 'playwright';
import { categories } from '../../src/internal/highlight/categories.mjs';
import { machineCases } from '../../tests/highlight/fixtures/machine-corpus.mjs';
import { memorySnapshot } from './memory-dump.mjs';
import { createScanner } from '../../src/internal/highlight/scanner.mjs';

export async function probeComponentLayout(project, directory, compiled, representation, runs = 3) {
  const entry =
    `export{CodeBlock}from ${JSON.stringify(join(directory, 'codeblock/index.js'))};` +
    `import ${JSON.stringify(join(directory, 'codeblock/define.js'))};` +
    compiled
      .filter(entry => entry.language !== 'shell')
      .map(entry => `import ${JSON.stringify(join(directory, `codeblock/languages/${entry.language}.js`))};`)
      .join('');
  const result = spawnSync(
    join(project, 'node_modules/.bin/esbuild'),
    ['--bundle', '--minify', '--format=esm', '--platform=browser', '--loader=js', '--log-level=error'],
    {
      cwd: project,
      env: { ...process.env, NODE_PATH: join(project, 'node_modules') },
      input: entry,
      encoding: 'utf8',
      maxBuffer: 16 * 1024 * 1024
    }
  );
  if (result.status !== 0) throw new Error(result.stderr || result.error?.message);
  const texts = compiled.map(({ language }) =>
    machineCases
      .filter(sample => sample.language === language)
      .map(sample => sample.text)
      .join('\n')
      .trim()
  );
  const updated = texts.map(text => `${text}\n42`);
  const expected = compiled.map(({ machine }, index) => createScanner(machine)(updated[index]));
  const records = [];
  for (let run = 0; run < runs; run++) {
    const browser = await chromium.launch({ headless: true });
    try {
      const page = await browser.newPage();
      const errors = [];
      page.on('pageerror', error => errors.push(error.message));
      await page.route('http://layout-probe.test/**', route =>
        route.fulfill({
          contentType: 'text/html',
          body: '<!doctype html><html lang="en"><head><title>Layout memory probe</title></head><body></body></html>'
        })
      );
      await page.goto('http://layout-probe.test/');
      const blank = await memorySnapshot(browser, page);
      const started = performance.now();
      await page.addScriptTag({ type: 'module', content: result.stdout });
      const loadWallMs = performance.now() - started;
      assert.deepEqual(errors, [], 'Consumer bundle initialization');
      assert.equal(await page.evaluate(() => !!customElements.get('nve-codeblock')), true, 'Component registration');
      const loaded = await memorySnapshot(browser, page);
      const timing = await page.evaluate(
        async ({ languages, texts }) => {
          const start = performance.now();
          window.layoutElements = languages.map((language, index) => {
            const element = document.createElement('nve-codeblock');
            element.language = language;
            element.code = texts[index];
            element.style.cssText = 'width:800px; max-height:400px; overflow:auto';
            document.body.append(element);
            return element;
          });
          await Promise.all(window.layoutElements.map(element => element.updateComplete));
          const initialUpdateMs = performance.now() - start;
          const updateSamplesMs = [];
          for (let update = 0; update < 6; update++) {
            const values = texts.map(text => `${text}\n${update % 2 ? '42' : '43'}`);
            const start = performance.now();
            for (const [index, element] of window.layoutElements.entries()) element.code = values[index];
            await Promise.all(window.layoutElements.map(element => element.updateComplete));
            updateSamplesMs.push(performance.now() - start);
          }
          await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
          void document.body.offsetHeight;
          return { initialUpdateMs, updateSamplesMs };
        },
        { languages: compiled.map(entry => entry.language), texts }
      );
      assert.deepEqual(errors, [], 'Component construction');
      const output = await page.evaluate(
        ({ categories }) =>
          window.layoutElements.map(element => {
            const code = element.shadowRoot.querySelector('code');
            const ranges = [];
            for (const [name, highlight] of CSS.highlights)
              for (const range of highlight) {
                if (code.contains(range.startContainer))
                  ranges.push([range.startOffset, range.endOffset, categories.indexOf(name.slice(9))]);
              }
            return {
              text: code.textContent,
              tokenElements: code.querySelectorAll('*').length,
              ranges: ranges.sort((a, b) => a[0] - b[0] || a[1] - b[1])
            };
          }),
        { categories }
      );
      for (const [index, element] of output.entries()) {
        assert.equal(element.text, updated[index], compiled[index].language);
        assert.equal(element.tokenElements, 0, compiled[index].language);
        assert.deepEqual(element.ranges, expected[index], compiled[index].language);
      }
      const active = await memorySnapshot(browser, page);
      const remainingRanges = await page.evaluate(async () => {
        for (const element of window.layoutElements) element.remove();
        window.layoutElements = null;
        await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
        void document.body.offsetHeight;
        return [...CSS.highlights.values()].reduce((count, highlight) => count + highlight.size, 0);
      });
      const removed = await memorySnapshot(browser, page);
      assert.equal(remainingRanges, 0);
      assert.deepEqual(errors, []);
      records.push({
        representation,
        run,
        browser: browser.version(),
        loadWallMs,
        ...timing,
        characters: updated.reduce((count, text) => count + text.length, 0),
        ranges: expected.reduce((count, ranges) => count + ranges.length, 0),
        remainingRanges,
        blank,
        loaded,
        active,
        removed
      });
    } finally {
      await browser.close();
    }
  }
  return records;
}
