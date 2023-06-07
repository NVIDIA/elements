const path = require('path');
const { mergeConfig } = require('vite');

const resolve = (rel) => path.resolve(process.cwd(), rel);

module.exports = {
  staticDirs: ['../.storybook/assets'],
  stories: [
    '../docs/**/*.stories.mdx',
    '../docs/**/*.stories.ts',
    '../src/**/*.stories.mdx',
    '../src/**/*.stories.ts',
    '../src/**/*.stories.tsx',
    '../tokens/**/*.stories.mdx',
    '../tokens/**/*.stories.ts'
  ],
  addons: ['@storybook/addon-links', '@storybook/addon-essentials'],
  framework: {
    name: '@storybook/web-components-vite'
  },
  async viteFinal(config) {
    return mergeConfig(config, {
      base: config.server ? undefined : '/ui/storybook/elements/',
      build: {
        target: 'esnext',
        minify: 'esnext'
      },
      resolve: {
        alias: {
          '@elements/elements': resolve('./dist'),
          'metrics': resolve('./metrics')
        }
      }
    });
  }
};
