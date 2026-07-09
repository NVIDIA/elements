import { createHash } from 'node:crypto';
import { appendFile, mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const INDEXNOW_ENDPOINT = 'https://api.indexnow.org/indexnow';
export const INDEXNOW_MANIFEST_VERSION = 1;
export const INDEXNOW_MAX_URLS = 10_000;

const KEY_PATTERN = /^[A-Za-z0-9-]{8,128}$/;
const REQUEST_TIMEOUT_MS = 30_000;
const MANIFEST_HASH_BATCH_SIZE = 50;
const RETRYABLE_STATUS = status => status === 429 || status >= 500;
const XML_ENTITIES = { '&amp;': '&', '&lt;': '<', '&gt;': '>', '&quot;': '"', '&apos;': "'" };
const request = (fetchImpl, url, options = {}) =>
  fetchImpl(url, { ...options, signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS) });

function required(value, name) {
  if (!value) throw new Error(`${name} is required`);
  return value;
}
const option = (options, name) => required(options[name], `--${name}`);

function normalizeSiteUrl(value) {
  const url = new URL(required(value, 'site URL'));
  if (!['http:', 'https:'].includes(url.protocol) || url.search || url.hash) {
    throw new Error(`Invalid site URL: ${value}`);
  }
  if (!url.pathname.endsWith('/')) url.pathname += '/';
  return url;
}

function validateManifest(manifest) {
  if (
    manifest?.version !== INDEXNOW_MANIFEST_VERSION ||
    !manifest.urls ||
    Array.isArray(manifest.urls) ||
    typeof manifest.urls !== 'object' ||
    Object.values(manifest.urls).some(hash => typeof hash !== 'string')
  ) {
    throw new Error('Invalid IndexNow manifest');
  }
  return manifest;
}

function decodeXml(value) {
  return value.replace(/&(?:amp|lt|gt|quot|apos);/g, entity => XML_ENTITIES[entity]);
}

function isWithinSite(url, siteUrl) {
  return (
    url.origin === siteUrl.origin &&
    (url.pathname === siteUrl.pathname.slice(0, -1) || url.pathname.startsWith(siteUrl.pathname))
  );
}

export function validateKey(key) {
  if (!KEY_PATTERN.test(key ?? '')) throw new Error('INDEXNOW_KEY must contain 8 to 128 letters, numbers, or dashes');
  return key;
}

export function extractSitemapUrls(xml) {
  return [...new Set([...xml.matchAll(/<loc>\s*([^<]+?)\s*<\/loc>/g)].map(match => decodeXml(match[1].trim())))].sort();
}

export function urlToHtmlPath(siteDir, siteUrlValue, value) {
  const siteUrl = normalizeSiteUrl(siteUrlValue);
  const url = new URL(value);
  if (!isWithinSite(url, siteUrl) || url.search || url.hash) {
    throw new Error(`Sitemap URL is outside the deployed site: ${value}`);
  }

  let relativePath = decodeURIComponent(url.pathname.slice(siteUrl.pathname.length));
  if (!relativePath || relativePath.endsWith('/')) relativePath += 'index.html';
  if (!relativePath.endsWith('.html')) throw new Error(`Sitemap URL is not an HTML page: ${value}`);

  const root = path.resolve(siteDir);
  const filePath = path.resolve(root, relativePath);
  if (!filePath.startsWith(`${root}${path.sep}`)) throw new Error(`Unsafe sitemap URL path: ${value}`);
  return filePath;
}

export async function generateManifest({ siteDir, siteUrl, sitemapXml }) {
  const urls = extractSitemapUrls(sitemapXml);
  const entries = [];
  for (const batch of chunkUrls(urls, MANIFEST_HASH_BATCH_SIZE)) {
    entries.push(
      ...(await Promise.all(
        batch.map(async url => {
          const content = await readFile(urlToHtmlPath(siteDir, siteUrl, url));
          return [url, createHash('sha256').update(content).digest('hex')];
        })
      ))
    );
  }
  return { version: INDEXNOW_MANIFEST_VERSION, urls: Object.fromEntries(entries) };
}

export function diffManifests(previousValue, currentValue) {
  const previous = validateManifest(previousValue).urls;
  const current = validateManifest(currentValue).urls;
  const previousUrls = Object.keys(previous);
  const currentUrls = Object.keys(current);
  const added = currentUrls.filter(url => !Object.hasOwn(previous, url)).sort();
  const modified = currentUrls.filter(url => Object.hasOwn(previous, url) && previous[url] !== current[url]).sort();
  const deleted = previousUrls.filter(url => !Object.hasOwn(current, url)).sort();
  return { added, modified, deleted, urls: [...added, ...modified, ...deleted] };
}

export async function createDiffPayload({ current, previousUrl, fetchImpl = fetch }) {
  const response = await fetchWithRetry(
    previousUrl,
    { headers: { accept: 'application/json' } },
    { fetchImpl, sleep: defaultSleep, attempts: 3 }
  );
  if (response.status === 404) {
    return { version: INDEXNOW_MANIFEST_VERSION, baseline: true, added: [], modified: [], deleted: [], urls: [] };
  }
  if (!response.ok) throw new Error(`Unable to fetch the previous IndexNow manifest: HTTP ${response.status}`);
  return { version: INDEXNOW_MANIFEST_VERSION, baseline: false, ...diffManifests(await response.json(), current) };
}

export function chunkUrls(urls, size = INDEXNOW_MAX_URLS) {
  const chunks = [];
  for (let index = 0; index < urls.length; index += size) chunks.push(urls.slice(index, index + size));
  return chunks;
}

const defaultSleep = milliseconds => new Promise(resolve => setTimeout(resolve, milliseconds));

async function retry(task, { sleep, attempts }) {
  let lastError;
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      return await task(attempt === attempts);
    } catch (error) {
      lastError = error;
    }
    if (attempt < attempts) await sleep(2 ** (attempt - 1) * 1_000);
  }
  throw lastError;
}

function fetchWithRetry(url, options, { fetchImpl, sleep, attempts }) {
  return retry(
    async lastAttempt => {
      const response = await request(fetchImpl, url, options);
      if (RETRYABLE_STATUS(response.status) && !lastAttempt) throw new Error(`HTTP ${response.status}`);
      return response;
    },
    { sleep, attempts }
  );
}

export async function waitForKey({ key, keyLocation, fetchImpl = fetch, sleep = defaultSleep, attempts = 5 }) {
  return retry(
    async () => {
      const response = await request(fetchImpl, keyLocation, { cache: 'no-store' });
      if (!response.ok || (await response.text()).trim() !== key) {
        throw new Error('The deployed IndexNow key file could not be verified');
      }
    },
    { sleep, attempts }
  );
}

export async function submitPayload({
  payload,
  key,
  siteUrl: siteUrlValue,
  endpoint = INDEXNOW_ENDPOINT,
  fetchImpl = fetch,
  sleep = defaultSleep,
  attempts = 4
}) {
  validateKey(key);
  const siteUrl = normalizeSiteUrl(siteUrlValue);
  if (payload?.version !== INDEXNOW_MANIFEST_VERSION || !Array.isArray(payload?.urls)) {
    throw new Error('Invalid IndexNow payload');
  }
  const urls = [...new Set(payload.urls)].sort();
  for (const value of urls) {
    const url = new URL(value);
    if (!isWithinSite(url, siteUrl)) throw new Error(`IndexNow URL is outside the deployed site: ${value}`);
  }
  if (!urls.length) return { submitted: 0, batches: 0, statuses: [] };
  const keyLocation = new URL(`${key}.txt`, siteUrl).href;
  await waitForKey({ key, keyLocation, fetchImpl, sleep, attempts: 5 });

  const statuses = [];
  for (const urlList of chunkUrls(urls)) {
    const response = await fetchWithRetry(
      endpoint,
      {
        method: 'POST',
        headers: { 'content-type': 'application/json; charset=utf-8' },
        body: JSON.stringify({ host: siteUrl.host, key, keyLocation, urlList })
      },
      { fetchImpl, sleep, attempts }
    );
    if (![200, 202].includes(response.status)) {
      throw new Error(`IndexNow rejected a URL batch: HTTP ${response.status}`);
    }
    statuses.push(response.status);
  }
  return { submitted: urls.length, batches: statuses.length, statuses };
}

async function writeJson(filePath, value) {
  await mkdir(path.dirname(filePath), { recursive: true });
  await writeFile(filePath, `${JSON.stringify(value, null, 2)}\n`);
}

async function appendSummary(title, message) {
  if (process.env.GITHUB_STEP_SUMMARY) await appendFile(process.env.GITHUB_STEP_SUMMARY, `## ${title}\n\n${message}\n`);
}

function parseArgs(values) {
  const [command, ...args] = values;
  const options = {};
  for (let index = 0; index < args.length; index += 2) {
    const name = args[index];
    if (!name?.startsWith('--') || args[index + 1] === undefined) throw new Error(`Invalid argument: ${name}`);
    options[name.slice(2)] = args[index + 1];
  }
  return { command, options };
}

async function prepare(options) {
  const siteDir = option(options, 'site-dir');
  const siteUrl = option(options, 'site-url');
  const key = validateKey(process.env.INDEXNOW_KEY);
  const sitemapXml = await readFile(path.join(siteDir, 'sitemap.xml'), 'utf8');
  const manifest = await generateManifest({ siteDir, siteUrl, sitemapXml });
  await Promise.all([
    writeJson(path.join(siteDir, 'indexnow-manifest.json'), manifest),
    writeFile(path.join(siteDir, `${key}.txt`), key)
  ]);
  await appendSummary('IndexNow preparation', `Prepared a manifest for ${Object.keys(manifest.urls).length} URLs.`);
}

async function diff(options) {
  const currentFile = option(options, 'current-file');
  const siteUrl = normalizeSiteUrl(option(options, 'site-url'));
  const outputFile = option(options, 'output-file');
  const current = validateManifest(JSON.parse(await readFile(currentFile, 'utf8')));
  const payload = await createDiffPayload({
    current,
    previousUrl: new URL('indexnow-manifest.json', siteUrl).href
  });
  await writeJson(outputFile, payload);
  const message = payload.baseline
    ? 'Established the initial baseline; no URLs will be submitted.'
    : `Detected ${payload.added.length} added, ${payload.modified.length} modified, and ${payload.deleted.length} deleted URLs.`;
  await appendSummary('IndexNow changes', message);
}

async function submit(options) {
  const payloadFile = option(options, 'payload-file');
  const siteUrl = option(options, 'site-url');
  const payload = JSON.parse(await readFile(payloadFile, 'utf8'));
  const result = await submitPayload({ payload, key: process.env.INDEXNOW_KEY, siteUrl });
  const message = result.submitted
    ? `Submitted ${result.submitted} URLs in ${result.batches} batch(es); responses: ${result.statuses.join(', ')}.`
    : 'No changed URLs required submission.';
  await appendSummary('IndexNow notification', message);
}

export async function main(values = process.argv.slice(2)) {
  const { command, options } = parseArgs(values);
  if (command === 'prepare') return prepare(options);
  if (command === 'diff') return diff(options);
  if (command === 'submit') return submit(options);
  throw new Error(`Unknown IndexNow command: ${command ?? ''}`);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch(error => {
    console.error(error.message);
    process.exitCode = 1;
  });
}
