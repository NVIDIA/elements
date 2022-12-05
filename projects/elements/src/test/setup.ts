
// filter out logs in vitest https://github.com/vitest-dev/vitest/issues/1700
const warn = console.warn;
console.warn = (...msg) => {
  if(!msg[0]?.includes('Lit is in dev mode')) {
    warn(...msg);
  }
}

export { };