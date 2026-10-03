import { resolve } from 'path';
import { playwright } from '@vitest/browser-playwright';
import { mergeConfig } from 'vitest/config';
import { libraryTestConfig } from '@internals/vite/configs/test.js';

export default mergeConfig(libraryTestConfig, {
  root: import.meta.dirname,
  resolve: {
    alias: { '@nvidia-elements/code': resolve(import.meta.dirname, './src') }
  },

  test: {
    browser: {
      provider: playwright({
        contextOptions: { permissions: ['clipboard-read', 'clipboard-write'] },
        launchOptions: {
          ...libraryTestConfig.test.browser.provider.options.launch,
          channel: process.env.NVE_TEST_BROWSER_CHANNEL,
          args: [...libraryTestConfig.test.browser.provider.options.launch.args, '--enable-blink-features=OpaqueRange']
        }
      })
    },
    include: ['./src/**/*.test.ts'],
    coverage: {
      thresholds: {
        lines: 90,
        branches: 87,
        functions: 90,
        statements: 90
      }
    }
  }
});
