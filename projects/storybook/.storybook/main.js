import * as path from 'path';

const resolve = (rel) => path.resolve(process.cwd(), rel);

export default {
  staticDirs: ['../.storybook/assets'],
  stories: [
    '../src/**/*.mdx',
    '../src/**/*.stories.ts',
    '../../elements/src/**/*.mdx',
    '../../elements/src/**/*.stories.ts',
    '../../elements-react/docs/**/*.mdx',
    '../../elements-react/docs/**/*.stories.tsx',
    '../../labs/behaviors-alpine/src/**/*.mdx',
    '../../labs/behaviors-alpine/src/**/*.stories.ts',
    '../../labs/code/src/**/*.mdx',
    '../../labs/code/src/**/*.stories.ts',
    '../../starters/lit-library/src/**/*.stories.ts',
    '../../styles/docs/**/*.mdx',
    '../../styles/docs/**/*.stories.ts',
    '../../testing/docs/**/*.mdx',
    '../../testing/docs/**/*.stories.ts',
    '../../themes/docs/**/*.mdx',
    '../../themes/docs/**/*.stories.ts'
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
        minify: 'esbuild'
      },
      optimizeDeps: {
        esbuildOptions: {
          target: "esnext",
        },
      },
      resolve: {
        alias: {
          '@storybook/addon-docs': resolve('node_modules/@storybook/addon-docs'),
          '@nvidia-elements/styles/CHANGELOG.md?raw': resolve('node_modules/@nvidia-elements/styles/CHANGELOG.md?raw'),
          '@nvidia-elements/themes/CHANGELOG.md?raw': resolve('node_modules/@nvidia-elements/themes/CHANGELOG.md?raw'),
          '@nvidia-elements/testing/CHANGELOG.md?raw': resolve('node_modules/@nvidia-elements/testing/CHANGELOG.md?raw'),
          '@nvidia-elements/core/CHANGELOG.md?raw': resolve('node_modules/@nvidia-elements/core/CHANGELOG.md?raw'),
          '@nvidia-elements/behaviors-alpine/CHANGELOG.md?raw': resolve('node_modules/@nvidia-elements/behaviors-alpine/CHANGELOG.md?raw'),
          '@nvidia-elements/code/CHANGELOG.md?raw': resolve('node_modules/@nvidia-elements/code/CHANGELOG.md?raw'),
          '@internals/storybook/blocks': resolve('.storybook/blocks.jsx')
        }
      }
    });
  }
};
