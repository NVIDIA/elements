import * as path from 'path';
import { mergeConfig } from 'vite';

const resolve = (rel) => path.resolve(process.cwd(), rel);

export default {
  staticDirs: ['../.storybook/assets'],
  stories: [
    '../docs/**/*.mdx',
    '../docs/**/*.stories.ts',
    '../src/**/*.mdx',
    '../src/**/*.stories.ts',
    '../tokens/**/*.mdx',
    '../tokens/**/*.stories.ts'
  ],
  addons: [
    '@storybook/addon-links',
    '@storybook/addon-essentials',
    '@storybook/addon-mdx-gfm'
  ],
  framework: {
    name: '@storybook/web-components-vite',
    options: {}
  },
  async viteFinal(config) {
    return mergeConfig(config, {
      server: {
        watch: {
          ignored: [
            resolve('node_modules/**'),
            resolve('.playwright/**'),
            resolve('.lighthouse/**'),
            resolve('.wireit/**'),
            resolve('build/**'),
            resolve('coverage/**'),
            resolve('dist-storybook/**'),
            `!${resolve('dist/**')}`
          ],
        },
      },
      build: {
        target: 'esnext',
        minify: 'esnext'
      },
      resolve: {
        alias: {
          '@elements/elements': resolve('./dist'),
          '@nvidia-elements/core': resolve('./dist'),
          'build': resolve('./build')
        }
      }
    });
  }
};
