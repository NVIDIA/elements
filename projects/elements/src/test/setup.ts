import { beforeAll, afterAll, vi } from 'vitest';
import styles from '@elements/elements/index.css?inline';

const sheet = new CSSStyleSheet();
sheet.replaceSync(`${styles}`);
document.adoptedStyleSheets = [...document.adoptedStyleSheets, sheet];
document.documentElement.setAttribute('mlv-theme', '');

// filter out logs in vitest https://github.com/vitest-dev/vitest/issues/1700
const warn = console.warn;
const log = (...msg) => {
  if((!msg[0]?.includes as any instanceof Function) && !msg[0]?.includes('Lit is in dev mode') && !msg[0]?.includes('scheduled an update')) {
    warn(...msg);
  }
}

console.warn = log;

await vi.dynamicImportSettled();

beforeAll(async () => {
  await vi.dynamicImportSettled();

  // axe does not support ElementInternals AOM yet https://github.com/nvaccess/nvda/issues/15118
  // this forces the polyfill to run if an AXE test and trigger the AOM reflection
  if (globalThis.axe) {
    window.ElementInternals = undefined;
    await import('element-internals-polyfill');
  }
});

afterAll(async () => {
  await vi.dynamicImportSettled();
  await new Promise(r => setTimeout(r, 0)); // https://github.com/vitest-dev/vitest/issues/2552
});
