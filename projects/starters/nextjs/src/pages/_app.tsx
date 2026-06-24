import Head from 'next/head';
import type { AppProps } from 'next/app';
import '@/styles/globals.css';
// import '@lit-labs/ssr-react/enable-lit-ssr.js';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <title>NVIDIA Elements + NextJS</title>
        <meta name="description" content="A simple starter using Elements and NextJS." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <Component {...pageProps} />
    </>
  );
}
