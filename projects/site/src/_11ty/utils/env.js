/* eslint-env node */
/* global process */

import { getElementsEnvValues } from '@internals/vite/configs/env.js';

const elementsEnv = getElementsEnvValues();

export const ELEMENTS_PAGES_BASE_URL = elementsEnv.ELEMENTS_PAGES_BASE_URL;
export const ELEMENTS_REPO_BASE_URL = elementsEnv.ELEMENTS_REPO_BASE_URL;
export const ELEMENTS_PLAYGROUND_BASE_URL = elementsEnv.ELEMENTS_PLAYGROUND_BASE_URL;
export const ELEMENTS_REGISTRY_URL = elementsEnv.ELEMENTS_REGISTRY_URL;
export const ELEMENTS_ESM_CDN_BASE_URL = elementsEnv.ELEMENTS_ESM_CDN_BASE_URL;
export const ELEMENTS_CDN_BASE_URL = elementsEnv.ELEMENTS_CDN_BASE_URL;
export const ELEMENTS_SITE_URL = elementsEnv.ELEMENTS_SITE_URL;
export const ELEMENTS_ASSETS_CDN_BASE_URL = elementsEnv.ELEMENTS_ASSETS_CDN_BASE_URL;
