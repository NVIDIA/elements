import { beforeAll } from 'vitest';
import styles from '@elements/elements/index.css?inline';

const sheet = new CSSStyleSheet();
sheet.replaceSync(`${styles}`);
document.adoptedStyleSheets = [...document.adoptedStyleSheets, sheet];
document.documentElement.setAttribute('nve-theme', '');

beforeAll(async () => {
  // axe does not support ElementInternals AOM yet https://github.com/nvaccess/nvda/issues/15118
  // this forces the polyfill to run if an AXE test and trigger the AOM reflection
  if (globalThis.axe) {
    window.ElementInternals = undefined;
    await import('element-internals-polyfill');
  }
});
