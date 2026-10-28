import { spawnSync } from 'node:child_process';
import { cpSync, existsSync, lstatSync, mkdirSync, readdirSync, rmSync, statSync } from 'node:fs';
import { join } from 'node:path';

const freshOutput = !existsSync('./dist');
if (freshOutput) {
  mkdirSync('./dist/starters', { recursive: true });
  mkdirSync('./dist/api', { recursive: true });
}

copySite(freshOutput);
cpSync('../internals/metadata/static/api.json', './dist/metadata/api.json');
cpSync('../internals/metadata/static/examples.json', './dist/metadata/examples.json');
cpSync('../internals/metadata/static/projects.json', './dist/metadata/projects.json');

cpSync('../cli/install.sh', './dist/install.sh');
cpSync('../cli/install.ps1', './dist/install.ps1');
if (existsSync('../cli/dist')) {
  mkdirSync('./dist/cli', { recursive: true });
  for (const bin of ['nve-macos-arm64', 'nve-linux-x64', 'nve-linux-arm64', 'nve-windows-x64']) {
    const src = `../cli/dist/${bin}`;
    const srcExe = `../cli/dist/${bin}.exe`;
    if (existsSync(src)) {
      copyBinary(src, `./dist/cli/${bin}`);
    } else if (existsSync(srcExe)) {
      copyBinary(srcExe, `./dist/cli/${bin}.exe`);
    }
  }
  if (existsSync('../cli/dist/manifest.json')) {
    cpSync('../cli/dist/manifest.json', './dist/cli/manifest.json');
  }
}

cpSync('../starters/dist/', './dist/starters/download/', { recursive: true });
cpSync('../starters/angular/dist/angular-starter/browser/', './dist/starters/angular/', { recursive: true });
cpSync('../starters/bundles/dist/', './dist/starters/bundles/', { recursive: true });
cpSync('../starters/importmaps/dist/', './dist/starters/importmaps/', { recursive: true });
cpSync('../starters/eleventy/dist/', './dist/starters/eleventy/', { recursive: true });
cpSync('../starters/mcp-app/dist/', './dist/starters/mcp-app/', { recursive: true });
cpSync('../starters/mpa/dist/', './dist/starters/mpa/', { recursive: true });
cpSync('../starters/nextjs/dist/', './dist/starters/nextjs/', { recursive: true });
cpSync('../starters/react/dist/', './dist/starters/react/', { recursive: true });
cpSync('../starters/solidjs/dist/', './dist/starters/solidjs/', { recursive: true });
cpSync('../starters/sphinx/dist/', './dist/starters/sphinx/', { recursive: true });
cpSync('../starters/svelte/dist/', './dist/starters/svelte/', { recursive: true });
cpSync('../starters/typescript/dist/', './dist/starters/typescript/', { recursive: true });
cpSync('../starters/vue/dist/', './dist/starters/vue/', { recursive: true });
cpSync('../starters/hugo/dist/', './dist/starters/hugo/', { recursive: true });

function copySite(freshOutput) {
  const source = '../site/dist/';
  const maskedPermissions = process.umask() | 0o7000;
  if (
    freshOutput &&
    process.platform === 'darwin' &&
    readdirSync(source, { recursive: true, withFileTypes: true }).every(entry => {
      if (!entry.isDirectory() && !entry.isFile()) return false;
      const mode = statSync(join(entry.parentPath, entry.name)).mode;
      if (entry.isDirectory() && (mode & 0o700) !== 0o700) return false;
      return (mode & (entry.isFile() ? maskedPermissions : 0o7000)) === 0;
    })
  ) {
    // macOS supports filesystem clones through cp; Node's clone flag falls back to copying here.
    const result = spawnSync('/bin/cp', ['-cR', `${source}.`, './dist/'], { stdio: 'ignore' });
    if (result.status === 0) return;
    // This invocation owns the fresh directory, so discard any partial clone before retrying.
    rmSync('./dist/', { recursive: true, force: true });
    mkdirSync('./dist/starters', { recursive: true });
    mkdirSync('./dist/api', { recursive: true });
  }
  cpSync(source, './dist/', { recursive: true });
}

function copyBinary(source, destination) {
  if (process.platform === 'darwin' && !lstatSync(destination, { throwIfNoEntry: false })) {
    const info = lstatSync(source);
    if (info.isFile() && (info.mode & (process.umask() | 0o7000)) === 0) {
      const result = spawnSync('/bin/cp', ['-c', source, destination], { stdio: 'ignore' });
      if (result.status === 0) return;
      rmSync(destination, { force: true });
    }
  }
  cpSync(source, destination);
}
