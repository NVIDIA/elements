// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { basename, dirname, join, parse, resolve } from 'node:path';
import { execFile, execFileSync } from 'node:child_process';
import { cwd } from 'node:process';
import { fileURLToPath } from 'node:url';

import { readFile, writeFile } from 'fs/promises';
import { existsSync, unlinkSync, writeFileSync, cpSync, createWriteStream, rmSync, readFileSync } from 'fs';
import { readWorkspaceManifest } from '@pnpm/workspace.read-manifest';
import { getCatalogsFromWorkspaceManifest } from '@pnpm/catalogs.config';
import { createExportableManifest } from '@pnpm/exportable-manifest';
import { readProjectManifestOnly } from '@pnpm/read-project-manifest';
import { ZipArchive } from 'archiver';
import AdmZip from 'adm-zip';
import { isCommandAvailable, getNPMClient } from '../internal/node.js';
import type { Report } from '../internal/types.js';
import { writeAllAgentConfigs } from './setup-agent.js';

const ELEMENTS_PAGES_BASE_URL = 'https://nvidia.github.io/elements';
const ELEMENTS_CDN_BASE_URL = 'https://cdn.jsdelivr.net/npm';
function findWorkspaceRoot(startDir: string) {
  let dir = startDir;
  while (dir !== dirname(dir)) {
    if (existsSync(join(dir, 'pnpm-workspace.yaml'))) {
      return dir;
    }
    dir = dirname(dir);
  }
  throw new Error(`Unable to find pnpm-workspace.yaml from ${startDir}`);
}

let repoWorkspaceDir: string | undefined;
function getRepoWorkspaceDir() {
  repoWorkspaceDir ??= findWorkspaceRoot(dirname(fileURLToPath(import.meta.url)));
  return repoWorkspaceDir;
}

type StarterCDNPackageName = '@nvidia-elements/core' | '@nvidia-elements/styles' | '@nvidia-elements/themes';

const starterCDNPackagePaths: Record<StarterCDNPackageName, string> = {
  '@nvidia-elements/core': 'projects/core/package.json',
  '@nvidia-elements/styles': 'projects/styles/package.json',
  '@nvidia-elements/themes': 'projects/themes/package.json'
};

const starterCDNAssets: { packageName: StarterCDNPackageName; filePath: string }[] = [
  { packageName: '@nvidia-elements/core', filePath: 'dist/bundles/index.min.js' },
  { packageName: '@nvidia-elements/styles', filePath: 'dist/bundles/index.css' },
  { packageName: '@nvidia-elements/themes', filePath: 'dist/bundles/index.css' },
  { packageName: '@nvidia-elements/themes', filePath: 'dist/fonts/inter.css' }
];

const cdnStampTargets = new Map<string, string>([
  ['go', 'src/index.html'],
  ['go-htmx', 'src/index.html']
]);

export type Starter =
  | 'angular'
  | 'bundles'
  | 'eleventy'
  | 'go'
  | 'go-htmx'
  | 'hugo'
  | 'importmaps'
  | 'lit-library'
  | 'lit'
  | 'mcp-app'
  | 'nextjs'
  | 'nuxt'
  | 'preact'
  | 'react'
  | 'solidjs'
  | 'svelte'
  | 'typescript'
  | 'vue';

type NPMClient = 'npm' | 'pnpm';

export const startersData = {
  angular: {
    zip: `${ELEMENTS_PAGES_BASE_URL}/starters/download/angular.zip`,
    cli: true
  },
  bundles: {
    zip: `${ELEMENTS_PAGES_BASE_URL}/starters/download/bundles.zip`,
    cli: true
  },
  eleventy: {
    zip: `${ELEMENTS_PAGES_BASE_URL}/starters/download/eleventy.zip`,
    cli: true
  },
  go: {
    zip: `${ELEMENTS_PAGES_BASE_URL}/starters/download/go.zip`,
    cli: true,
    setupDependencies: false
  },
  'go-htmx': {
    zip: `${ELEMENTS_PAGES_BASE_URL}/starters/download/go-htmx.zip`,
    cli: true,
    setupDependencies: false
  },
  hugo: {
    zip: `${ELEMENTS_PAGES_BASE_URL}/starters/download/hugo.zip`,
    cli: true
  },
  importmaps: {
    zip: `${ELEMENTS_PAGES_BASE_URL}/starters/download/importmaps.zip`,
    cli: false
  },
  'lit-library': {
    zip: `${ELEMENTS_PAGES_BASE_URL}/starters/download/lit-library.zip`,
    cli: true
  },
  lit: {
    zip: null,
    cli: false
  },
  'mcp-app': {
    zip: `${ELEMENTS_PAGES_BASE_URL}/starters/download/mcp-app.zip`,
    cli: true
  },
  nextjs: {
    zip: `${ELEMENTS_PAGES_BASE_URL}/starters/download/nextjs.zip`,
    cli: true
  },
  nuxt: {
    zip: `${ELEMENTS_PAGES_BASE_URL}/starters/download/nuxt.zip`,
    cli: true
  },
  preact: {
    zip: null,
    cli: false
  },
  react: {
    zip: `${ELEMENTS_PAGES_BASE_URL}/starters/download/react.zip`,
    cli: true
  },
  solidjs: {
    zip: `${ELEMENTS_PAGES_BASE_URL}/starters/download/solidjs.zip`,
    cli: true
  },
  svelte: {
    zip: `${ELEMENTS_PAGES_BASE_URL}/starters/download/svelte.zip`,
    cli: true
  },
  typescript: {
    zip: `${ELEMENTS_PAGES_BASE_URL}/starters/download/typescript.zip`,
    cli: true
  },
  vue: {
    zip: `${ELEMENTS_PAGES_BASE_URL}/starters/download/vue.zip`,
    cli: true
  }
};

/* istanbul ignore next -- @preserve */
export async function archiveStarter(projectDir: string, outDir: string) {
  const dist = join(outDir, projectDir);
  await copyProject(projectDir, dist);
  await stampStarterCDNVersionFiles(projectDir, dist);
  writeAllAgentConfigs(dist);
  const packageJSON = await exportPackageFromWorkspace(projectDir);
  await writeFile(join(dist, 'package.json'), JSON.stringify(packageJSON, undefined, 2));
  await writeFile(join(dist, '.npmrc'), 'registry=https://registry.npmjs.org/');
  await zipProject(dist);
}

/* istanbul ignore next -- @preserve */
async function zipProject(outDir: string) {
  const output = createWriteStream(`${outDir}.zip`);
  output.on('error', err => console.error('Error writing to zip file:', err));

  const archive = new ZipArchive({ zlib: { level: 9 } });
  archive.pipe(output);
  archive.directory(outDir, false);
  await archive.finalize();

  rmSync(outDir, { recursive: true });
}

/* istanbul ignore next -- @preserve */
function copyProject(projectDir: string, dist: string) {
  const ignoreDirs = new Set(['dist', 'node_modules', '.wireit', '.eslintcache', 'bin']);
  cpSync(projectDir, dist, {
    recursive: true,
    filter: src => !ignoreDirs.has(basename(src))
  });
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function getPackageVersion(repoRoot: string, packageName: StarterCDNPackageName): string {
  const packageJsonPath = join(repoRoot, starterCDNPackagePaths[packageName]);
  const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8')) as { version?: unknown };
  if (typeof packageJson.version !== 'string' || !packageJson.version) {
    throw new Error(`No version found for ${packageName} in ${packageJsonPath}`);
  }
  return packageJson.version;
}

function getStarterCDNPackageVersions(repoRoot: string): Record<StarterCDNPackageName, string> {
  return {
    '@nvidia-elements/core': getPackageVersion(repoRoot, '@nvidia-elements/core'),
    '@nvidia-elements/styles': getPackageVersion(repoRoot, '@nvidia-elements/styles'),
    '@nvidia-elements/themes': getPackageVersion(repoRoot, '@nvidia-elements/themes')
  };
}

export function createStarterCDNUrl(packageName: StarterCDNPackageName, version: string, filePath: string) {
  return `${ELEMENTS_CDN_BASE_URL}/${packageName}@${version}/${filePath}`;
}

export function stampStarterCDNVersions(content: string, versions: Record<StarterCDNPackageName, string>) {
  return starterCDNAssets.reduce((updatedContent, asset) => {
    const versionedUrl = createStarterCDNUrl(asset.packageName, versions[asset.packageName], asset.filePath);
    const urlPattern = new RegExp(
      `${escapeRegExp(ELEMENTS_CDN_BASE_URL)}/${escapeRegExp(asset.packageName)}(?:@[^/"']+)?/${escapeRegExp(asset.filePath)}`,
      'g'
    );
    return updatedContent.replace(urlPattern, versionedUrl);
  }, content);
}

async function stampStarterCDNVersionFiles(projectDir: string, dist: string) {
  const stampTarget = cdnStampTargets.get(projectDir);
  if (!stampTarget) {
    return;
  }

  const indexPath = join(dist, stampTarget);
  const versions = getStarterCDNPackageVersions(getRepoWorkspaceDir());
  const content = await readFile(indexPath, 'utf8');
  await writeFile(indexPath, stampStarterCDNVersions(content, versions));
}

/* istanbul ignore next -- @preserve */
async function exportPackageFromWorkspace(projectDir: string) {
  const workspace = await readWorkspaceManifest(getRepoWorkspaceDir());
  const catalogs = getCatalogsFromWorkspaceManifest(workspace);
  const manifest = await readProjectManifestOnly(projectDir);
  let exportable = await createExportableManifest(projectDir, manifest, { catalogs });
  exportable = removeWireitScripts(
    exportable as unknown as { scripts: Record<string, string>; wireit?: Record<string, { command: string }> }
  );
  return exportable;
}

export function removeWireitScripts(exportable: {
  scripts: Record<string, string>;
  wireit?: Record<string, { command: string }>;
}) {
  Object.keys(exportable.scripts)
    .filter(key => exportable.scripts[key] === 'wireit' && exportable.wireit?.[key])
    .forEach(key => {
      exportable.scripts[key] = exportable.wireit![key]!.command;

      const scriptValue = exportable.scripts[key];
      if (scriptValue && scriptValue.match(/playwright-lock '(.*?)'/g)) {
        const match = scriptValue.match(/playwright-lock '(.*?)'/g);
        exportable.scripts[key] = (match?.[0] ?? '').replace('playwright-lock', '').replaceAll(`'`, '').trim();
      }
    });
  exportable.wireit = undefined;
  return exportable;
}

/* istanbul ignore next -- @preserve */
export async function createStarter(starter: Starter, outDir: string = resolve(cwd())): Promise<Report> {
  try {
    const downloadPath = startersData[starter].zip;
    if (!downloadPath) {
      throw new Error(`No download URL for starter "${starter}"`);
    }
    const { archivePath, extractedPath } = createStarterPaths(starter, outDir);
    await downloadStarter(downloadPath, archivePath);
    await extractStarter(archivePath, extractedPath);
    await setupStarterGit(extractedPath);
    await setupStarterNPM(extractedPath);
    console.log('🎉 Starter created successfully');
    return {
      create: {
        message: 'Starter created successfully',
        status: 'success'
      }
    };
  } catch (error) {
    return {
      create: {
        message: `Failed to create starter: ${(error as Error).message}`,
        status: 'danger'
      }
    };
  }
}

export function createStarterPaths(starter: Starter, outDir: string) {
  return {
    archivePath: join(outDir, `${starter}.zip`),
    extractedPath: join(outDir, starter)
  };
}

/* istanbul ignore next -- @preserve */
async function downloadStarter(starterPath: string, outPath: string) {
  console.log('⏳ Downloading starter...');
  const response = await fetch(starterPath);
  const blob = await response.blob();
  const arrayBuffer = await blob.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  writeFileSync(outPath, buffer);
}

/* istanbul ignore next -- @preserve */
async function extractStarter(archivePath: string, outDir: string) {
  const zip = new AdmZip(archivePath);
  zip.extractAllTo(outDir, true);
  unlinkSync(archivePath);
}

/* istanbul ignore next -- @preserve */
async function setupStarterGit(extractedDir: string) {
  const hasGit = await isCommandAvailable('git');
  if (hasGit && !isGitRepository(extractedDir)) {
    console.log('🔄 Initializing git...');
    await new Promise<void>((resolve, reject) => {
      const child = createGitInitProcess(extractedDir);
      child.on('close', code => (code === 0 ? resolve() : reject(new Error(`git init exited with code ${code}`))));
      child.on('error', reject);
    });
  } else {
    console.log('🔄 Skipping git initialization...');
  }
}

export function createGitInitProcess(extractedDir: string) {
  return execFile('git', ['init', extractedDir]);
}

export function getDependencyInstallFailureMessage(extractedDir: string, npmClient: NPMClient | null) {
  if (npmClient) {
    return `⚠️ Error installing dependencies, in the "${extractedDir}" directory run "${npmClient} install"`;
  }

  return `⚠️ Error installing dependencies, install npm or pnpm, then run a package-manager install in the "${extractedDir}" directory`;
}

/* istanbul ignore next -- @preserve */
function isGitRepository(directoryPath: string) {
  // Check if .git directory exists directly in the given path
  const gitDirPath = join(directoryPath, '.git');
  if (existsSync(gitDirPath)) {
    return true;
  }

  // If not found, traverse up the parent directories
  let currentPath = directoryPath;
  while (currentPath !== parse(currentPath).root) {
    const parentGitDirPath = join(currentPath, '.git');
    if (existsSync(parentGitDirPath)) {
      return true;
    }
    currentPath = dirname(currentPath);
  }

  return false;
}

/* istanbul ignore next -- @preserve */
async function setupStarterNPM(cwd: string) {
  console.log('📦 Installing dependencies...');
  const npmClient = await getRequiredNPMClient();
  const { code, stdout, stderr } = await runPackageManagerInstall(npmClient, cwd);

  if (code === 0) {
    return;
  }

  const output = `${stdout}\n${stderr}`;
  if (output.includes('ERR_PNPM_IGNORED_BUILDS')) {
    console.log('⚠️ Some dependency build scripts were skipped. Run "pnpm approve-builds" if needed.');
    return;
  }

  const message = output.trim() || `${npmClient} install exited with code ${code}`;
  throw new Error(message);
}

/* istanbul ignore next -- @preserve */
function runPackageManagerInstall(npmClient: NPMClient, cwd: string) {
  return new Promise<{ code: number; stdout: string; stderr: string }>((resolve, reject) => {
    const child = execPackageManager(npmClient, ['install'], cwd);
    let stdout = '';
    let stderr = '';

    child.stdout?.on('data', (data: Buffer) => {
      stdout += data.toString();
    });
    child.stderr?.on('data', (data: Buffer) => {
      stderr += data.toString();
    });
    child.on('close', code => resolve({ code: code ?? 1, stdout, stderr }));
    child.on('error', reject);
  });
}

/* istanbul ignore next -- @preserve */
export async function startStarter(extractedPath: string) {
  const npmClient = await getNPMClient();
  if (npmClient) {
    console.log('🚀 Starting project...');

    try {
      execPackageManagerSync(npmClient, ['run', 'dev'], extractedPath);
    } catch (e) {
      if (e instanceof Error && 'signal' in e && e.signal === 'SIGINT') {
        console.log('\n👋 Stopped.');
        return;
      }
      console.error(e);
    }
  }
}

export async function getRequiredNPMClient() {
  const npmClient = await getNPMClient();
  if (npmClient === 'npm' || npmClient === 'pnpm') return npmClient;
  throw new Error('No supported package manager found.');
}

export function execPackageManager(npmClient: NPMClient, args: string[], cwd: string) {
  return npmClient === 'pnpm' ? execFile('pnpm', args, { cwd }) : execFile('npm', args, { cwd });
}

function execPackageManagerSync(npmClient: NPMClient, args: string[], cwd: string) {
  const options = { cwd, stdio: 'inherit' as const };
  npmClient === 'pnpm' ? execFileSync('pnpm', args, options) : execFileSync('npm', args, options);
}

export const claudeProjectSettings = {
  $schema: 'https://json.schemastore.org/claude-code-settings.json',
  permissions: {
    allow: [
      'mcp__elements__api_list',
      'mcp__elements__api_get',
      'mcp__elements__api_template_validate',
      'mcp__elements__api_imports_get',
      'mcp__elements__api_tokens_list',
      'mcp__elements__examples_list',
      'mcp__elements__examples_get',
      'mcp__elements__skills_list',
      'mcp__elements__skills_get',
      'mcp__elements__project_create',
      'mcp__elements__project_setup',
      'mcp__elements__project_validate',
      'mcp__elements__packages_list',
      'mcp__elements__packages_get',
      'mcp__elements__packages_changelogs_get'
    ]
  },
  enabledMcpjsonServers: ['elements']
};
