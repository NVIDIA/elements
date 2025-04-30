import * as path from 'path';

const resolve = (rel) => path.resolve(process.cwd(), rel);

export default {
  staticDirs: [
    '../.storybook/assets'
  ],
  stories: [
    '../src/**/*.mdx',
    '../src/**/*.stories.ts',
    '../../elements/src/**/*.mdx',
    '../../elements/src/**/*.stories.ts',
    '../../labs/behaviors-alpine/src/**/*.mdx',
    '../../labs/behaviors-alpine/src/**/*.stories.ts',
    '../../labs/brand/src/**/*.mdx',
    '../../labs/brand/src/**/*.stories.ts',
    '../../labs/code/src/**/*.mdx',
    '../../labs/code/src/**/*.stories.ts',
    '../../labs/forms/src/**/*.stories.ts',
    '../../monaco/src/**/*.mdx',
    '../../monaco/src/**/*.stories.ts',
    '../../starters/lit-library/src/**/*.stories.ts',
    '../../styles/docs/**/*.mdx',
    '../../styles/docs/**/*.stories.ts',
    '../../testing/docs/**/*.mdx',
    '../../testing/docs/**/*.stories.ts',
    '../../themes/docs/**/*.mdx',
    '../../themes/docs/**/*.stories.ts',
    '../../internals/elements-api/src/**/*.stories.ts'
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
          '@storybook/addon-docs': resolve('node_modules/@storybook/addon-docs'),
          '@nve-internals/storybook/blocks': resolve('.storybook/blocks.jsx')
        }
      }
    });
  }
};
