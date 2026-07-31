import { resolve } from 'path';
import { mergeConfig } from 'vitest/config';
import { playwright } from '@vitest/browser-playwright';
import { libraryTestConfig } from '@internals/vite/configs/test.js';

export default mergeConfig(libraryTestConfig, {
  root: import.meta.dirname,
  resolve: {
    alias: { '@nvidia-elements/core': resolve(import.meta.dirname, './src') }
  },
  test: {
    include: ['./src/**/*.test.ts'],
    browser: {
      provider: playwright(),
      instances: [
        {
          browser: 'chromium',
          name: 'chromium-native-iframe',
          include: ['./src/iframe/iframe.test.ts'],
          provider: playwright({
            launchOptions: {
              args: ['--enable-blink-features=ResponsiveIframes']
            }
          })
        }
      ]
    },
    coverage: {
      exclude: [
        '**/docs/**',
        '**/polyfills/**',
        '**/index.js',
        '**/src/index.ts',
        '**/src/icon/icons/**',
        '**/src/icon/icons.ts',
        '**/src/icon/server.ts',
        '**/src/internal/controllers/type-ssr.controller.ts',
        '**/internal/docs.ts'
      ]
    }
  }
});
