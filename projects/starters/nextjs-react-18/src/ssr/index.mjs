/*
 So @lit-labs/ssr-react/enable-lit-ssr.js does not expose wrapJsx, so we cannot do our own wrapCreateElement
 so instead we use the following approach to wrap createElement with a fallback.

 1) Use `pre.ts` to capture the original React.createElement that is untouched.
 2) Allow @lit-labs/ssr-react to wrap and replace createElement with its own logic.
 3) Replace React.createElement with a wrapper that calls the @lit-labs/ssr-react version
    and falls back to the original if there is an SSR error.
*/
await import('./pre.ts');
await import('@lit-labs/ssr-react/enable-lit-ssr.js');
await import('./post.ts');
