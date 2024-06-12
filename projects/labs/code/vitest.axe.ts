import { resolve } from 'path';
import { mergeConfig } from 'vitest/config';
import { libraryAxeTestConfig } from '@nve-internals/vite';

export default mergeConfig(libraryAxeTestConfig, {
  test: {
    alias: { '@nvidia-elements/code': resolve(import.meta.dirname, './dist') }
  }
});
