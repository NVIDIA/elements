import * as path from 'path';

const resolve = (rel) => path.resolve(process.cwd(), rel);

export default {
  staticDirs: [
    '../.storybook/assets'
  ],
  stories: [
    '../src/**/*.mdx',
    '../../elements/src/**/*.stories.ts',
    '../../labs/behaviors-alpine/src/**/*.stories.ts',
    '../../labs/brand/src/**/*.stories.ts',
    '../../labs/code/src/**/*.stories.ts',
    '../../labs/forms/src/**/*.stories.ts',
    '../../monaco/src/**/*.stories.ts',
    '../../starters/lit-library/src/**/*.stories.ts',
    '../../styles/**/*.stories.ts',
    '../../themes/**/*.stories.ts',
    '../../internals/elements-api/src/**/*.stories.ts',
    '../../internals/patterns/src/**/*.stories.ts'
  ],
  addons: [
    '@storybook/addon-links',
    {
      name: '@storybook/addon-essentials',
      options: {
        'actions': false,
        'controls': false,
        'backgrounds': false
      }
    }
  ],
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
      },
      resolve: {
        alias: {
          '@storybook/addon-docs': resolve('node_modules/@storybook/addon-docs')
        }
      }
    });
  }
};
