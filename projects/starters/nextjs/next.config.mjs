import withLitSSR from '@lit-labs/nextjs';

/** @type {import('next').NextConfig} */
const nextConfig = {
  basePath: '/elements/starters/nextjs',
  output: 'export',
  distDir: 'dist',
  reactStrictMode: true
};

export default withLitSSR({})(nextConfig);
