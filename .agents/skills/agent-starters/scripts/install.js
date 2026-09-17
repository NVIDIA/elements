// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { createHash } from 'node:crypto';
import { createReadStream, existsSync } from 'node:fs';
import { chmod, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { createIsolatedEnvironment, runCommand } from './environment.js';

const INSTALL_URL = 'https://nvidia.github.io/elements/install.sh';
const INSTALLER_SOURCE = fileURLToPath(new URL('../../../../projects/cli/install.sh', import.meta.url));
const MAX_REDIRECTS = 5;
const REDIRECT_STATUSES = new Set([301, 302, 303, 307, 308]);
const TRUSTED_HOSTS = new Set(['nvidia.github.io']);

function cleanText(value) {
  return String(value ?? '')
    .replaceAll('\u001b', '')
    .trim();
}

async function sha256(file) {
  const hash = createHash('sha256');
  for await (const chunk of createReadStream(file)) hash.update(chunk);
  return hash.digest('hex');
}

function trustedUrl(value) {
  const url = new URL(value);
  if (
    url.protocol !== 'https:' ||
    !TRUSTED_HOSTS.has(url.hostname) ||
    (url.port && url.port !== '443') ||
    url.username ||
    url.password
  ) {
    throw new Error('Refusing installer URL outside the approved HTTPS origin.');
  }
  return url;
}

async function fetchTo(url, destination, expectedSha256) {
  const signal = AbortSignal.timeout(60_000);
  let currentUrl = trustedUrl(url);

  for (let redirects = 0; ; redirects += 1) {
    const response = await fetch(currentUrl, { redirect: 'manual', signal });
    if (REDIRECT_STATUSES.has(response.status)) {
      await response.body?.cancel();
      if (redirects >= MAX_REDIRECTS) throw new Error(`Download exceeded ${MAX_REDIRECTS} redirects.`);
      const location = response.headers.get('location');
      if (!location) throw new Error(`Download redirect from ${currentUrl.href} did not include a Location header.`);
      currentUrl = trustedUrl(new URL(location, currentUrl));
      continue;
    }
    if (!response.ok) throw new Error(`Download failed: ${currentUrl.href} returned HTTP ${response.status}.`);

    const content = Buffer.from(await response.arrayBuffer());
    const actualSha256 = createHash('sha256').update(content).digest('hex');
    if (actualSha256 !== expectedSha256) {
      throw new Error('Downloaded installer did not match the trusted repository SHA-256.');
    }
    await writeFile(destination, content);
    return;
  }
}

function parseStarterChoices(help) {
  const match = help.match(/\[choices:\s*([^\]]+)\]/s);
  if (!match) throw new Error('Production CLI help did not expose starter choices.');
  return [...match[1].matchAll(/["']([^"']+)["']/g)].map(result => result[1]);
}

export async function installProductionCli(runRoot, toolBin, progress) {
  const isolated = await createIsolatedEnvironment(runRoot, 'cli');
  const installer = path.join(isolated.root, 'install.sh');
  progress('CLI: downloading the public installer');
  await fetchTo(INSTALL_URL, installer, await sha256(INSTALLER_SOURCE));
  await chmod(installer, 0o700);
  const nveHome = path.join(isolated.root, 'nve');
  const env = { ...isolated.env, NVE_HOME: nveHome, PATH: `${toolBin}:/usr/bin:/bin:/usr/sbin:/sbin` };
  const install = await runCommand('bash', [installer], {
    env,
    logFile: path.join(isolated.root, 'install.log'),
    progress,
    progressLabel: 'CLI installation',
    timeoutMs: 180_000
  });
  const binary = path.join(nveHome, 'bin', 'nve');
  const manifestPath = path.join(nveHome, 'manifest.json');
  if (!install.ok || !existsSync(binary) || !existsSync(manifestPath)) {
    throw new Error(`Production CLI installation failed. See ${path.join(isolated.root, 'install.log')}.`);
  }
  const version = await runCommand(binary, ['--version'], { env, timeoutMs: 30_000 });
  if (!version.ok || !version.stdout.trim()) throw new Error('Installed CLI did not report a version.');
  const manifest = JSON.parse(await readFile(manifestPath, 'utf8'));
  if (manifest.version !== version.stdout.trim()) {
    throw new Error('CLI manifest version did not match `nve --version`.');
  }
  const help = await runCommand(binary, ['project.create', '--help'], { env, timeoutMs: 30_000 });
  if (!help.ok) throw new Error('Installed CLI did not expose project.create help.');
  return {
    binary,
    env,
    inventory: parseStarterChoices(`${help.stdout}\n${help.stderr}`),
    provenance: {
      binarySha256: await sha256(binary),
      canonicalBinaryPath: manifest.canonicalBinaryPath,
      installUrl: INSTALL_URL,
      installerSha256: await sha256(installer),
      manifest,
      version: version.stdout.trim()
    }
  };
}

export async function toolVersions(toolBin) {
  const env = { ...process.env, PATH: `${toolBin}:/usr/bin:/bin:/usr/sbin:/sbin` };
  const values = {};
  for (const [name, command, args] of [
    ['node', 'node', ['--version']],
    ['pnpm', 'pnpm', ['--version']],
    ['npm', 'npm', ['--version']],
    ['go', 'go', ['version']],
    ['hugo', 'hugo', ['version']]
  ]) {
    const result = await runCommand(command, args, { env, timeoutMs: 15_000 });
    values[name] = result.ok ? cleanText(result.stdout || result.stderr) : null;
  }
  return values;
}
