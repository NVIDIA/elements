import * as path from 'path';

const resolve = (rel) => path.resolve(process.cwd(), rel);

export default {
  stories: [
    '../src/**/*.md',
    '../../elements/src/**/*.stories.ts',
    '../../labs/behaviors-alpine/src/**/*.stories.ts',
    '../../labs/brand/src/**/*.stories.ts',
    '../../labs/code/src/**/*.stories.ts',
    '../../labs/forms/src/**/*.stories.ts',
    '../../monaco/src/**/*.stories.ts',
    '../../starters/lit-library/src/**/*.stories.ts',
    '../../styles/src/**/*.stories.ts',
    '../../themes/src/**/*.stories.ts',
    '../../internals/patterns/src/**/*.stories.ts'
  ],
  addons: ['@storybook/addon-links'],
  framework: {
    name: '@storybook/web-components-vite',
    options: {}
  },
  async viteFinal(config) {
    const { mergeConfig } = await import('vite'); // https://github.com/storybookjs/storybook/issues/26291

    return mergeConfig(config, {
      server: {
        watch: {
          ignored: [
            resolve('.wireit/**')
          ],
        },
      },
      build: {
        target: 'esnext', // https://github.com/storybookjs/storybook/issues/22223
        minify: 'esbuild',
        assetsInclude: ['node_modules/@nvidia-elements/monaco/dist/*.worker.js']
      },
      optimizeDeps: {
        esbuildOptions: {
          target: "esnext",
        },
      }
    });
  }
};
