import { resolve } from 'path';
import { mergeConfig } from 'vitest/config';
import { libraryTestConfig } from '@internals/vite';

export default mergeConfig(libraryTestConfig, {
  test: {
    include: ['./src/**/*.test.ts'],
    alias: { '@nvidia-elements/monaco': resolve(import.meta.dirname, './src') },
    isolate: true,
    coverage: {
      exclude: [
        'src/vendor/**', // ignore vendored code
        'src/workers/*.ts' // ignore the re-exported web workers
      ]
    }
  }
});
