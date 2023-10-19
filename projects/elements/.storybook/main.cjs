const path = require('path');
const { mergeConfig } = require('vite');

const resolve = (rel) => path.resolve(process.cwd(), rel);

// https://storybook.js.org/docs/react/faq#how-do-i-fix-module-resolution-while-using-pnpm-plug-n-play
const wrapForPnp = (packageName) => path.dirname(require.resolve(path.join(packageName, 'package.json')));

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
  addons: [wrapForPnp('@storybook/addon-links'), wrapForPnp('@storybook/addon-essentials')],
  framework: {
    name: wrapForPnp('@storybook/web-components-vite')
  },
  async viteFinal(config) {
    return mergeConfig(config, {
      base: config.server ? undefined : '/ui/storybook/elements/',
      server: {
        watch: {
          ignored: [resolve('node_modules/**'), resolve('.playwright/**'), resolve('.wireit/**'), resolve('coverage/**'), resolve('storybook-build/**'), `!${resolve('dist/**')}`],
        },
      },
      build: {
        target: 'esnext',
        minify: 'esnext'
      },
      resolve: {
        alias: {
          '@elements/elements': resolve('./dist'),
          'build': resolve('./build')
        }
      }
    });
  }
};
