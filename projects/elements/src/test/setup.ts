import { GlobalRegistrator } from '@happy-dom/global-registrator';

// directly setup happy dom so bazel can find dependencies, otherwise vite dynamically loads happy dom causing it to fail
if (!globalThis.registerHappyDom) {
 GlobalRegistrator.register();
 globalThis.registerHappyDom = true;
}

// filter out logs in vitest https://github.com/vitest-dev/vitest/issues/1700
const warn = console.warn;
const log = (...msg) => {
  if((!msg[0]?.includes as any instanceof Function) && !msg[0]?.includes('Lit is in dev mode') && !msg[0]?.includes('scheduled an update')) {
    warn(...msg);
  }
}

console.warn = log;

export { };