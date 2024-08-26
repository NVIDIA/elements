export function getEnv(): 'development' | 'production' {
  return globalThis.process?.env?.NODE_ENV !== 'production' ||
    globalThis.location?.hostname === 'localhost' ||
    /* istanbul ignore next -- @preserve */
    globalThis.location?.href?.includes('playground-elements')
    ? 'development'
    : 'production';
}
