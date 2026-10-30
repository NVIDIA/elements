import assert from 'node:assert/strict';
import { mkdtemp, mkdir, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { test } from 'node:test';
import { ESLint } from 'eslint';
import {
  appConfig,
  browserJavaScriptConfig,
  browserTypescriptConfig,
  cssConfig,
  htmlConfig,
  jsonConfig,
  libraryConfig,
  litConfig,
  nodeJavaScriptConfig,
  nodeTypescriptConfig
} from '../index.js';

for (const [name, preset] of Object.entries({
  appConfig,
  browserJavaScriptConfig,
  browserTypescriptConfig,
  cssConfig,
  htmlConfig,
  jsonConfig,
  libraryConfig,
  litConfig,
  nodeJavaScriptConfig,
  nodeTypescriptConfig
})) {
  test(`${name} excludes browser artifacts from filesystem traversal`, async t => {
    const cwd = await mkdtemp(join(tmpdir(), 'elements-eslint-ignores-'));
    t.after(() => rm(cwd, { recursive: true, force: true }));
    await mkdir(join(cwd, 'src'));
    await writeFile(join(cwd, 'src/example.js'), 'debugger;');
    for (const runner of ['render', 'visual', 'lighthouse']) {
      for (const directory of ['.tmp-scenario', 'dist/scenario/assets', 'reports']) {
        const path = join(cwd, `.${runner}`, directory);
        await mkdir(path, { recursive: true });
        await writeFile(join(path, '_entry0.js'), 'invalid JavaScript fixture {{{');
      }
    }

    const eslint = new ESLint({
      cwd,
      overrideConfigFile: true,
      overrideConfig: [{ files: ['**/*.js'], rules: { 'no-debugger': 'error' } }, ...preset]
    });
    const results = await eslint.lintFiles('.');
    assert.deepEqual(
      results.map(result => result.filePath),
      [join(cwd, 'src/example.js')]
    );
    assert.deepEqual(
      results[0].messages.map(message => message.ruleId),
      ['no-debugger']
    );
  });
}
