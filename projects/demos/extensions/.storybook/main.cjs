const path = require('path');
const { mergeConfig } = require('vite');
const resolve = (rel) => path.resolve(process.cwd(), rel);

module.exports = {
  stories: [
    '../src/**/*.stories.mdx',
    '../src/**/*.stories.ts'
  ],
  addons: ['@storybook/addon-links', '@storybook/addon-essentials'],
  framework: {
    name: '@storybook/web-components-vite'
  },
  async viteFinal(config) {
    return mergeConfig(config, {
      build: {
        target: 'esnext',
        minify: 'esnext'
      },
      resolve: {
        alias: {
          'extensions-elements-starter': resolve('./dist')
        }
      }
    });
  }
};
