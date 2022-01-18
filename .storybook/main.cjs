module.exports = {
  stories: ['../src/**/*.stories.mdx', '../src/**/*.stories.@(js|jsx|ts|tsx)'],
  // stories: [
  //   { directory: '../src', files: '*.stories.ts', titlePrefix: 'foo' }
  // ], // this feature will auto generate titles enabled by CSF3.0 but latest storybook-builder-vite 0.1.13 doesn't support waiting for 2.x
  addons: [
    'storybook-dark-mode',
    'storybook-addon-designs',
    '@storybook/addon-essentials',
  ],
  framework: '@storybook/web-components',
  core: {
    builder: 'storybook-builder-vite',
  },
  async viteFinal(config) {
    config.server.port = 7777;
    config.server.hmr = {
      protocol: 'ws',
    };

    return config;
  },
};
