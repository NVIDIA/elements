import process from 'node:process';
import { resolve } from 'node:path';
import { playwright } from '@vitest/browser-playwright';
import { mergeConfig } from 'vitest/config';
import { libraryBenchConfig } from '@internals/vite/configs/bench.js';

import { readFile } from 'node:fs/promises';
const manifest = JSON.parse(
  await readFile(new URL('./src/internal/highlight/generated/manifest.json', import.meta.url), 'utf8')
);
const machines = Object.fromEntries(
  await Promise.all(
    manifest.languages.map(async ({ language }: { language: string }) => [
      language,
      (await import(new URL(`./src/internal/highlight/generated/${language}.mjs`, import.meta.url).href)).default
    ])
  )
);

export default mergeConfig(libraryBenchConfig, {
  root: import.meta.dirname,
  resolve: { alias: { '@nvidia-elements/code': resolve(import.meta.dirname, './src') } },
  define: { __NVE_SCANNER_MACHINES__: JSON.stringify(machines) },
  test: {
    browser: {
      provider: playwright({
        launchOptions: {
          ...libraryBenchConfig.test.browser.provider.options.launch,
          channel: process.env.NVE_TEST_BROWSER_CHANNEL,
          args: [...libraryBenchConfig.test.browser.provider.options.launch.args, '--enable-blink-features=OpaqueRange']
        }
      })
    },
    benchmark: { include: ['src/**/*.test.bench.ts'] },
    outputFile: { json: './coverage/bench/summary.json' }
  }
});
