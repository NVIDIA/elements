/* eslint-env node */
/* global process */

import { parse, parseFragment, serialize } from 'parse5';

import {
  DEPLOYED_SITE_URL,
  ELEMENTS_SITE_ORIGIN,
  getSitePath as getBaseFreeSitePath,
  getSiteHref,
  getSiteUrl
} from '../utils/site-url.js';

const URL_ATTRIBUTES = new Set(['href', 'src']);
const SKIPPED_CHILD_TAGS = new Set(['script', 'style', 'template']);
const ROOT_RELATIVE_SEGMENT_PATTERN = /^\.?\/?(?:docs|examples|starters|static|_internal|local-bundles)(?:\/|$)/;
const ROOT_RELATIVE_FILE_PATTERN = /^\.?\/?(?:favicon\.svg|install\.(?:sh|cmd))(?:[?#]|$)/;
const SCHEME_PATTERN = /^[a-z][a-z\d+.-]*:/i;
const DEPLOYED_SITE = new URL(DEPLOYED_SITE_URL);
const DEPLOYED_SITE_ORIGIN = DEPLOYED_SITE.origin;
const DEPLOYED_SITE_PATH = DEPLOYED_SITE.pathname.replace(/\/$/, '');
const IS_FULL_DOCUMENT_PATTERN = /<!doctype|<html[\s>]/i;

function isHtmlOutput(outputPath, content) {
  if (outputPath) return outputPath.endsWith('.html');

  return IS_FULL_DOCUMENT_PATTERN.test(content);
}

function isSameSiteUrl(url) {
  const isSameOrigin = url.origin === ELEMENTS_SITE_ORIGIN || url.origin === DEPLOYED_SITE_ORIGIN;
  if (!isSameOrigin) return false;
  if (!DEPLOYED_SITE_PATH) return true;

  return url.pathname === DEPLOYED_SITE_PATH || url.pathname.startsWith(`${DEPLOYED_SITE_PATH}/`);
}

function getRootRelativeSitePath(value) {
  if (value === '.' || value === './') return '/';

  const path = value.replace(/^\.\//, '');

  if (ROOT_RELATIVE_SEGMENT_PATTERN.test(path) || ROOT_RELATIVE_FILE_PATTERN.test(path)) return `/${path}`;

  return null;
}

function removeDeployedSitePath(url) {
  const sitePath = `${url.pathname}${url.search}${url.hash}`;
  const baseFreeSitePath = getBaseFreeSitePath(sitePath);

  if (baseFreeSitePath !== sitePath) return baseFreeSitePath;
  if (!DEPLOYED_SITE_PATH) return sitePath;
  if (url.pathname === DEPLOYED_SITE_PATH) return `/${url.search}${url.hash}`;
  if (url.pathname.startsWith(`${DEPLOYED_SITE_PATH}/`)) {
    return `${url.pathname.slice(DEPLOYED_SITE_PATH.length)}${url.search}${url.hash}`;
  }

  return sitePath;
}

function getSitePathCandidate(value) {
  const url = value.trim();

  if (!url || url.startsWith('#') || url.startsWith('//')) return null;

  if (SCHEME_PATTERN.test(url)) {
    if (!url.startsWith('http://') && !url.startsWith('https://')) return null;
    if (!URL.canParse(url)) return null;

    const parsedUrl = new URL(url);
    if (!isSameSiteUrl(parsedUrl)) return null;

    return removeDeployedSitePath(parsedUrl);
  }

  if (url.startsWith('/')) return url;

  return getRootRelativeSitePath(url);
}

function resolveSiteUrl(value) {
  const sitePath = getSitePathCandidate(value);

  if (!sitePath) return value;
  if (process.env.ELEVENTY_RUN_MODE === 'build') return getSiteHref(sitePath);

  return getBaseFreeSitePath(sitePath);
}

function getAttribute(node, name) {
  if (!Array.isArray(node.attrs)) return undefined;

  return node.attrs.find(attribute => attribute.name === name);
}

function hasRel(node, value) {
  return getAttribute(node, 'rel')?.value.trim().toLowerCase().split(/\s+/).includes(value) ?? false;
}

function resolveCanonicalUrl(value) {
  const sitePath = getSitePathCandidate(value);

  return sitePath ? getSiteUrl(sitePath) : value;
}

function resolveAttributeUrl(node, attribute) {
  if (node.nodeName === 'link' && attribute.name === 'href' && hasRel(node, 'canonical')) {
    return resolveCanonicalUrl(attribute.value);
  }

  return resolveSiteUrl(attribute.value);
}

function isModuleScript(node) {
  return getAttribute(node, 'type')?.value.trim().toLowerCase() === 'module';
}

function resolveSourceModuleUrl(value) {
  const sitePath = getSitePathCandidate(value);

  if (!sitePath) return value;

  return getBaseFreeSitePath(sitePath);
}

function transformSourceModuleAttribute(node) {
  if (node.nodeName !== 'script' || !isModuleScript(node)) return false;

  const src = getAttribute(node, 'src');
  if (!src) return false;

  const value = resolveSourceModuleUrl(src.value);
  const changed = value !== src.value;
  src.value = value;

  return changed;
}

function transformAttributes(node) {
  if (!Array.isArray(node.attrs)) return false;

  return node.attrs
    .filter(attribute => URL_ATTRIBUTES.has(attribute.name))
    .map(attribute => {
      const value = resolveAttributeUrl(node, attribute);
      const changed = value !== attribute.value;
      attribute.value = value;

      return changed;
    })
    .some(Boolean);
}

function transformNode(node) {
  if (node.nodeName === 'script') return transformSourceModuleAttribute(node);

  if (SKIPPED_CHILD_TAGS.has(node.nodeName)) return false;

  const changed = transformAttributes(node);

  return (node.childNodes ?? []).map(transformNode).some(Boolean) || changed;
}

export async function siteUrlsTransform(content, outputPath) {
  if (!isHtmlOutput(outputPath ?? this.page?.outputPath, content)) return content;

  const document = IS_FULL_DOCUMENT_PATTERN.test(content) ? parse(content) : parseFragment(content);

  if (!transformNode(document)) return content;

  return serialize(document);
}
