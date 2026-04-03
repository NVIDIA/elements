import type { NextConfig } from 'next';
// import withLitSSR from '@lit-labs/nextjs';
// https://github.com/lit/lit/issues/5209

const nextConfig: NextConfig = {
  basePath: '/elements/starters/nextjs',
  output: 'export',
  distDir: 'dist',
  reactStrictMode: true
};

export default nextConfig;
// export default withLitSSR({})(nextConfig);
