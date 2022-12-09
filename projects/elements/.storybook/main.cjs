const path = require('path');

const { addons } = require('@elements/custom-elements-storybook');

module.exports = {
  staticDirs: ['../.storybook/assets'],
  stories: [
    '../src/**/*.stories.mdx',
    '../src/**/*.stories.ts',
    '../src/**/*.stories.tsx',
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
    config.resolve.alias = { '@elements/elements': path.resolve(__dirname, '../dist') };
    
    if (config.server) {
      config.server.port = 7777;
      config.server.hmr = {
        protocol: 'ws'
      };
    } else {
      config.base = '/ui/storybook/elements/';
    }

    return config;
  }
};
