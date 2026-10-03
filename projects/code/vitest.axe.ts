import { resolve } from 'path';
import { playwright } from '@vitest/browser-playwright';
import { mergeConfig } from 'vitest/config';
import { libraryAxeTestConfig } from '@internals/vite/configs/axe.js';

export default mergeConfig(libraryAxeTestConfig, {
  root: import.meta.dirname,

  resolve: {
    alias: { '@nvidia-elements/code': resolve(import.meta.dirname, './src') }
  },
  test: {
    browser: {
      provider: playwright({
        launchOptions: { channel: process.env.NVE_TEST_BROWSER_CHANNEL, args: ['--enable-blink-features=OpaqueRange'] }
      })
    },
    include: ['./src/**/*.test.axe.ts'],
    outputFile: {
      junit: './coverage/axe/junit.xml'
    }
  }
});
