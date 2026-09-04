import { resolve } from 'node:path';
import { defineConfig, mergeConfig, type UserConfig } from 'vite';
import { libraryBuildConfig } from '@internals/vite';

const config: UserConfig = {
  resolve: {
    alias: { '@nvidia-elements/scene': resolve(import.meta.dirname, './src') }
  }
};

export default defineConfig(mergeConfig(libraryBuildConfig, config));
