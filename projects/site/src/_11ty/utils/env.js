/* eslint-env node */
/* global process */

function getEnvValue(name, fallback = '') {
  const value = process.env[name]?.trim();

  return value || fallback;
}

export const ELEMENTS_PAGES_BASE_URL = getEnvValue('ELEMENTS_PAGES_BASE_URL', 'https://nvidia.github.io/elements');
export const ELEMENTS_REPO_BASE_URL = getEnvValue('ELEMENTS_REPO_BASE_URL', 'https://github.com/NVIDIA/elements');
export const ELEMENTS_SITE_URL = getEnvValue('ELEMENTS_SITE_URL', 'https://nvidia.github.io');
export const ELEMENTS_PLAYGROUND_BASE_URL = getEnvValue('ELEMENTS_PLAYGROUND_BASE_URL');
export const ELEMENTS_REGISTRY_URL = getEnvValue('ELEMENTS_REGISTRY_URL');
export const ELEMENTS_ASSETS_CDN_BASE_URL = getEnvValue('ELEMENTS_ASSETS_CDN_BASE_URL');
export const ELEMENTS_ESM_CDN_BASE_URL = getEnvValue('ELEMENTS_ESM_CDN_BASE_URL');
export const ELEMENTS_CDN_BASE_URL = getEnvValue('ELEMENTS_CDN_BASE_URL');
