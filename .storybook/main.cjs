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
  ],
  framework: '@storybook/web-components',
  core: {
    builder: 'storybook-builder-vite',
  },
  features: {
    interactionsDebugger: true,
  },
  async viteFinal(config) {
    config.server.port = 7777;
    config.server.hmr = {
      protocol: 'ws',
    };

    config.optimizeDeps = {
      ...(config.optimizeDeps || {}),
      include: [
        ...(config?.optimizeDeps?.include || []),
        // Fix: `@storybook/addon-interactions` exports is not defined or `jest-mock` does not provide an export named 'fn'
        // Fix: fn() is not defined, see: https://github.com/storybookjs/storybook/issues/15391
        'jest-mock',
      ],
    };

    return config;
  },
};
