const path = require('path');
const CssHmr = require('rollup-plugin-css-hmr');

module.exports = {
  stories: ['../src/**/*.stories.mdx', '../src/**/*.stories.@(js|jsx|ts|tsx)'],
  // stories: [
  //   { directory: '../src', files: '*.stories.ts', titlePrefix: 'foo' }
  // ], // this feature will auto generate titles enabled by CSF3.0 but latest storybook-builder-vite 0.1.13 doesn't support waiting for 2.x
  addons: [
    'storybook-dark-mode',
    'storybook-addon-designs',
    '@storybook/addon-essentials',
    '@storybook/addon-interactions',
    '@etchteam/storybook-addon-status'
  ],
  framework: '@storybook/web-components',
  core: {
    builder: 'storybook-builder-vite'
  },
  features: {
    interactionsDebugger: true
  },
  staticDirs: [
    { from: '../public/assets', to: 'public/assets' },
    { from: '../public/css', to: 'public/css' }
  ],
  async viteFinal(config) {
    config.plugins = [...config.plugins, CssHmr('.ts')]; // triggers hot reload when modifying .css files

    // Workaround: https://github.com/storybookjs/storybook/issues/10887#issuecomment-901109891
    config.resolve.dedupe = ['@storybook/client-api'];

    if (config.server) {
      config.server.port = 7777;
      config.server.hmr = {
        protocol: 'ws'
      };
    } else {
      config.base = '/ui/storybook/elements/'
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

    // TODO: Revisit when Storybook 6.5 ships with a fix for impacts from Emotion 11 release on docs addon
    // Workaround: https://github.com/eirslett/storybook-builder-vite/issues/219#issuecomment-1023666193
    // Related: https://github.com/storybookjs/storybook/issues/16716
    config.resolve.alias = {
      ...config.resolve.alias,
      '@emotion/react': path.resolve(path.join(__dirname, '../node_modules/@emotion/react')),
      '@emotion/styled': path.resolve(path.join(__dirname, '../node_modules/@emotion/styled')),
      '@emotion/core': path.resolve(path.join(__dirname, '../node_modules/@emotion/react')),
      'emotion-theming': path.resolve(path.join(__dirname, '../node_modules/@emotion/react'))
    };

    return config;
  }
};
