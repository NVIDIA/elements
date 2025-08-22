/* istanbul ignore next -- @preserve */
export function getEnv(): 'development' | 'production' {
  if (
    globalThis.process?.env?.NODE_ENV !== 'production' &&
    (globalThis.location?.hostname === 'localhost' || globalThis.location?.href?.includes('elements-playground'))
  ) {
    return 'development';
  } else {
    return 'production';
  }
}
