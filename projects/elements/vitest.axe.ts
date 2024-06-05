import { resolve } from 'path';
import { defineConfig, mergeConfig } from 'vitest/config';
import { libraryTestConfig } from '@internals/vite';

export default defineConfig(() => {
  const config = {
    test: {
      include: ['./src/**/*.test.axe.ts'],
      alias: { '@nvidia-elements/core': resolve(import.meta.dirname, './src') },
      setupFiles: [resolve(import.meta.dirname, './src/test/setup.ts')],
      outputFile: {
        junit: './coverage/axe/junit.xml'
      }
    }
  };

  return mergeConfig(libraryTestConfig, config);
});
