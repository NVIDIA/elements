// import withLitSSR from '@lit-labs/nextjs';
// https://github.com/lit/lit/pull/4774

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true
};

export default withLitSSR({})(nextConfig);

// This is our own custom version of @lit-labs/nextjs that allows us to enable SSR support for lit components.
// but also allows us to fallback to non-SSR component by component if the component has critical issues with SSR.
// We then have our fallback version inject data attributes to indicate the SSR error that was encountered.
function withLitSSR() {
  return (nextConfig = {}) => {
    return Object.assign({}, nextConfig, {
      webpack: (config, options) => {
        const { isServer } = options;
        // Avoid issues with multiple lit versions being loaded with SSR due to development/production mismatch.
        // just force production mode for both server and client.
        config.resolve.conditionNames = ['production', isServer ? 'node' : 'browser', 'module'];

        const imports = [];
        if (isServer) {
          // Use top level await in server code to support ensuring import order.
          // of our side effects createElement patching code.
          config.experiments = {
            topLevelAwait: true
          };

          imports.push('side-effects @/ssr/index.mjs');
          imports.push('side-effects @nvidia-elements/core/icon/server.js');
        } else {
          imports.push('side-effects @lit-labs/ssr-react/enable-lit-ssr.js');
        }
        config.module.rules.unshift({
          test: /\/pages\/.*\.(?:j|t)sx?$|\/app\/.*\.(?:j|t)sx?$/,
          exclude: /next\/dist\//,
          loader: 'imports-loader',
          options: {
            imports
          }
        });

        // Apply user provided custom webpack config function if it exists.
        if (typeof nextConfig.webpack === 'function') {
          return nextConfig.webpack(config, options);
        }
        return config;
      }
    });
  };
}
