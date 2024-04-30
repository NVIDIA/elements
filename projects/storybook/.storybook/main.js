import * as path from 'path';
import { mergeConfig } from 'vite';

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
    '../../labs/lighthouse/docs/**/*.mdx',
    '../../labs/lighthouse/docs/**/*.stories.ts',
    '../../testing/docs/**/*.mdx',
    '../../testing/docs/**/*.stories.ts',
    '../../themes/docs/**/*.mdx',
    '../../themes/docs/**/*.stories.ts'
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
            resolve('.wireit/**')
          ],
        },
      },
      build: {
        target: 'esnext',
        minify: 'esnext'
      },
      resolve: {
        alias: {
          '@storybook/addon-docs': resolve('node_modules/@storybook/addon-docs'),
          '@nvidia-elements/themes/CHANGELOG.md?raw': resolve('node_modules/@nvidia-elements/themes/CHANGELOG.md?raw'),
          '@nvidia-elements/testing/CHANGELOG.md?raw': resolve('node_modules/@nvidia-elements/testing/CHANGELOG.md?raw'),
          '@nvidia-elements/core/CHANGELOG.md?raw': resolve('node_modules/@elements/elements/CHANGELOG.md?raw'),
          '@nvidia-elements/core/internal': resolve('node_modules/@elements/elements/dist/internal'),
          '@nvidia-elements/core': '@elements/elements', // temporary alias until 1.0
          '@nvidia-elements/core-react': '@elements/elements-react', // temporary alias until 1.0
        }
      }
    });
  }
};
