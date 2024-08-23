import withLitSSR from '@lit-labs/nextjs';

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true
};

export default withLitSSR({})(nextConfig);
