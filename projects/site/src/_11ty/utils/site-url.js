/* eslint-env node */
/* global process */

import { ELEMENTS_PAGES_BASE_URL, ELEMENTS_SITE_URL } from './env.js';

export const ELEMENTS_SITE_ORIGIN = ELEMENTS_SITE_URL.replace(/\/+$/, '');

export const BASE_URL = normalizeBasePath(process.env.PAGES_BASE_URL);
export const DEPLOYED_SITE_URL = getDeployedSiteUrl();
export const IS_LOCAL_PREVIEW = process.env.LOCAL_PREVIEW === 'true';
const BASE_PATH = BASE_URL === '/' ? '' : BASE_URL.replace(/\/$/, '');

export function normalizeBasePath(value) {
  const path = String(value ?? '')
    .trim()
    .replace(/^\/+|\/+$/g, '');

  return path ? `/${path}/` : '/';
}

export function getDeployedSiteUrl() {
  const pagesBaseUrl = ELEMENTS_PAGES_BASE_URL.trim().replace(/\/+$/, '');

  if (pagesBaseUrl) return pagesBaseUrl;
  if (BASE_URL === '/') return ELEMENTS_SITE_ORIGIN;

  return `${ELEMENTS_SITE_ORIGIN}${BASE_URL.replace(/\/$/, '')}`;
}

function normalizeSitePath(path) {
  const value = String(path ?? '/').trim();
  if (!value) return '/';
  return value.startsWith('/') ? value : `/${value}`;
}

function removeDuplicateBasePath(pathname) {
  if (!BASE_PATH) return pathname;

  const duplicateBasePath = `${BASE_PATH}${BASE_PATH}`;

  if (pathname === duplicateBasePath) return BASE_PATH;
  if (pathname.startsWith(`${duplicateBasePath}/`)) return `${BASE_PATH}${pathname.slice(duplicateBasePath.length)}`;

  return pathname;
}

function addBasePath(path) {
  const url = new URL(normalizeSitePath(path), ELEMENTS_SITE_ORIGIN);
  url.pathname = removeDuplicateBasePath(url.pathname);

  if (!BASE_PATH || url.pathname === BASE_PATH || url.pathname.startsWith(`${BASE_PATH}/`)) {
    return `${url.pathname}${url.search}${url.hash}`;
  }

  const pathname = url.pathname === '/' ? `${BASE_PATH}/` : `${BASE_PATH}${url.pathname}`;
  return `${pathname}${url.search}${url.hash}`;
}

function removeBasePath(path) {
  const url = new URL(normalizeSitePath(path), ELEMENTS_SITE_ORIGIN);
  url.pathname = removeDuplicateBasePath(url.pathname);

  if (BASE_PATH && url.pathname === BASE_PATH) {
    return `/${url.search}${url.hash}`;
  }

  if (BASE_PATH && url.pathname.startsWith(`${BASE_PATH}/`)) {
    return `${url.pathname.slice(BASE_PATH.length)}${url.search}${url.hash}`;
  }

  return `${url.pathname}${url.search}${url.hash}`;
}

export function getSiteHref(path = '/') {
  if (process.env.ELEVENTY_RUN_MODE === 'build' && !IS_LOCAL_PREVIEW) return getSiteUrl(path);
  return addBasePath(path);
}

export function getSitePath(path = '/') {
  return removeBasePath(path);
}

export function getSiteUrl(path = '/') {
  const normalizedPath = removeBasePath(path);

  return `${DEPLOYED_SITE_URL}${normalizedPath}`;
}
