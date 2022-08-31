const path = require('path');

const { addons } = require('@elements/custom-elements-storybook');

module.exports = {
  staticDirs: [{ from: '../public/assets', to: '/assets' }],
  stories: [
    '../src/**/*.stories.mdx',
    '../src/**/*.stories.ts',
    '../tokens/**/*.stories.mdx',
    '../tokens/**/*.stories.ts'
  ],
  addons: [...addons, '@geometricpanda/storybook-addon-badges'],
  framework: '@storybook/web-components',
  core: {
    builder: '@storybook/builder-vite'
  },
  features: {
    interactionsDebugger: true
  },
  async viteFinal(config) {
    config.logLevel = 'error';

    if (!process.env['BAZEL_WORKSPACE']) {
      config.resolve.alias = { '@elements/elements': path.resolve(__dirname, '../dist') };
    }

    if (config.server) {
      config.server.port = 7777;
      config.server.hmr = {
        protocol: 'ws'
      };
    } else {
      config.base = '/ui/storybook/elements/';
    }

    config.optimizeDeps = {
      ...(config.optimizeDeps || {}),
      include: [
        ...(config?.optimizeDeps?.include || []),
        // Fix: `@storybook/addon-interactions` exports is not defined or `jest-mock` does not provide an export named 'fn'
        // Fix: fn() is not defined, see: https://github.com/storybookjs/storybook/issues/15391
        'jest-mock'
      ]
    };

    return config;
  }
};
