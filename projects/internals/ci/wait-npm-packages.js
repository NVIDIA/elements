import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const DEFAULT_TIMEOUT_MS = 10 * 60 * 1000;
export const DEFAULT_INTERVAL_MS = 5 * 1000;
export const REQUEST_TIMEOUT_MS = 30_000;

const defaultSleep = ms => new Promise(resolve => setTimeout(resolve, ms));
const request = (fetchImpl, url) =>
  fetchImpl(url, { cache: 'no-store', signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS) });
const retryableStatus = status => status === 404 || status === 429 || status >= 500;

export function npmVersionUrl({ identifier, version, registryBaseUrl = 'https://registry.npmjs.org' }) {
  const base = registryBaseUrl.replace(/\/$/, '');
  const encodedName = identifier.replaceAll('/', '%2F');
  return `${base}/${encodedName}/${encodeURIComponent(version)}`;
}

export function extractNpmPackages(manifest) {
  if (!Array.isArray(manifest?.packages)) {
    throw new Error('server.json must include a packages array');
  }

  return manifest.packages
    .filter(pkg => pkg.registryType === 'npm')
    .map(pkg => {
      if (!pkg.identifier || !pkg.version) {
        throw new Error('npm package entries must include identifier and version');
      }
      return {
        identifier: pkg.identifier,
        version: pkg.version,
        registryBaseUrl: pkg.registryBaseUrl ?? 'https://registry.npmjs.org'
      };
    });
}

export async function waitForNpmPackages(
  packages,
  {
    fetchImpl = fetch,
    sleep = defaultSleep,
    timeoutMs = Number(process.env.WAIT_NPM_TIMEOUT_MS) || DEFAULT_TIMEOUT_MS,
    intervalMs = Number(process.env.WAIT_NPM_INTERVAL_MS) || DEFAULT_INTERVAL_MS,
    now = Date.now,
    log = message => console.error(message)
  } = {}
) {
  const deadline = now() + timeoutMs;

  for (const pkg of packages) {
    const url = npmVersionUrl(pkg);
    while (true) {
      const response = await request(fetchImpl, url);
      if (response.status === 200) {
        log(`npm package ${pkg.identifier}@${pkg.version} is available`);
        break;
      }
      if (!retryableStatus(response.status)) {
        throw new Error(
          `Unexpected npm registry response for ${pkg.identifier}@${pkg.version}: HTTP ${response.status}`
        );
      }
      if (now() >= deadline) {
        throw new Error(`Timed out waiting for npm package ${pkg.identifier}@${pkg.version} at ${url}`);
      }
      await sleep(intervalMs);
    }
  }
}

export async function main(values = process.argv.slice(2), options = {}) {
  const [manifestPath] = values;
  if (!manifestPath) throw new Error('Usage: wait-npm-packages.js <server.json>');
  const manifest = JSON.parse(await readFile(manifestPath, 'utf8'));
  await waitForNpmPackages(extractNpmPackages(manifest), options);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch(error => {
    console.error(error.message);
    process.exitCode = 1;
  });
}
