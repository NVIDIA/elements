import { getEsmHostedWarning } from '../utils/audit-logs.js';

declare global {
  var process: { env?: { NODE_ENV?: string } } | undefined;
}

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

export function getHostDetails(): { moduleHost: string; pageHost: string } {
  const pageHost = globalThis.location?.hostname;
  const moduleHost = new URL(import.meta.url).hostname;
  const isEsmHosted = moduleHost.startsWith('esm.');

  if (isEsmHosted && pageHost !== 'localhost' && pageHost !== 'esm.nvidia.com') {
    console.warn(getEsmHostedWarning());
  }

  return {
    pageHost,
    moduleHost
  };
}
