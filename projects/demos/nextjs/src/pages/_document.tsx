import { Html, Head as head, Main, NextScript as nextScript } from 'next/document';

// casting to any due to monorepo hoisting issue
const Head = head as any;
const NextScript = nextScript as any;

export default function Document() {
  return (
    <Html lang="en" nve-theme="dark">
      <Head />
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
