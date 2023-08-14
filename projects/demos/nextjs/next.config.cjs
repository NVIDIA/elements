const withLitSSR = require('@lit-labs/nextjs')(); // https://github.com/lit/lit/tree/main/packages/labs/nextjs

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Add your own config here
  reactStrictMode: true,
  swcMinify: true,
};

module.exports = withLitSSR(nextConfig);
