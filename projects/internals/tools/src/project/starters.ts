import { basename, dirname, join, parse, resolve } from 'node:path';
import { exec, execSync } from 'node:child_process';
import { cwd } from 'node:process';

import { writeFile } from 'fs/promises';
import { existsSync, unlinkSync, writeFileSync, cpSync, createWriteStream, rmSync } from 'fs';
import { readWorkspaceManifest } from '@pnpm/workspace.read-manifest';
import { getCatalogsFromWorkspaceManifest } from '@pnpm/catalogs.config';
import { createExportableManifest } from '@pnpm/exportable-manifest';
import { readProjectManifestOnly } from '@pnpm/read-project-manifest';
import archiver from 'archiver';
import AdmZip from 'adm-zip';
import { isCommandAvailable, getNPMClient } from '../internal/node.js';
import type { Report } from '../internal/types.js';
import { writeAllAgentConfigs } from './setup-agent.js';

declare const __ELEMENTS_PAGES_BASE_URL__: string;
declare const __ELEMENTS_REGISTRY_URL__: string;

export type Starter =
  | 'angular'
  | 'bundles'
  | 'eleventy'
  | 'extensions'
  | 'go'
  | 'importmaps'
  | 'lit-library'
  | 'lit'
  | 'nextjs'
  | 'nuxt'
  | 'preact'
  | 'react'
  | 'solidjs'
  | 'svelte'
  | 'typescript'
  | 'vue';

export const startersData = {
  angular: {
    zip: `${__ELEMENTS_PAGES_BASE_URL__}/starters/download/angular.zip`,
    cli: true
  },
  bundles: {
    zip: `${__ELEMENTS_PAGES_BASE_URL__}/starters/download/bundles.zip`,
    cli: true
  },
  eleventy: {
    zip: `${__ELEMENTS_PAGES_BASE_URL__}/starters/download/eleventy.zip`,
    cli: true
  },
  extensions: {
    zip: `${__ELEMENTS_PAGES_BASE_URL__}/starters/download/scoped-registry.zip`,
    cli: false
  },
  go: {
    zip: `${__ELEMENTS_PAGES_BASE_URL__}/starters/download/go.zip`,
    cli: true
  },
  hugo: {
    zip: `${__ELEMENTS_PAGES_BASE_URL__}/starters/download/hugo.zip`,
    cli: true
  },
  importmaps: {
    zip: `${__ELEMENTS_PAGES_BASE_URL__}/starters/download/importmaps.zip`,
    cli: false
  },
  'lit-library': {
    zip: `${__ELEMENTS_PAGES_BASE_URL__}/starters/download/lit-library.zip`,
    cli: false
  },
  lit: {
    zip: null,
    cli: false
  },
  nextjs: {
    zip: `${__ELEMENTS_PAGES_BASE_URL__}/starters/download/nextjs.zip`,
    cli: true
  },
  nuxt: {
    zip: `${__ELEMENTS_PAGES_BASE_URL__}/starters/download/nuxt.zip`,
    cli: true
  },
  preact: {
    zip: null,
    cli: false
  },
  react: {
    zip: `${__ELEMENTS_PAGES_BASE_URL__}/starters/download/react.zip`,
    cli: true
  },
  solidjs: {
    zip: `${__ELEMENTS_PAGES_BASE_URL__}/starters/download/solidjs.zip`,
    cli: true
  },
  svelte: {
    zip: `${__ELEMENTS_PAGES_BASE_URL__}/starters/download/svelte.zip`,
    cli: true
  },
  typescript: {
    zip: `${__ELEMENTS_PAGES_BASE_URL__}/starters/download/typescript.zip`,
    cli: true
  },
  vue: {
    zip: `${__ELEMENTS_PAGES_BASE_URL__}/starters/download/vue.zip`,
    cli: true
  }
};

/* istanbul ignore next -- @preserve */
export async function archiveStarter(projectDir: string, outDir: string) {
  const dist = `${outDir}/${projectDir}`;
  await copyProject(projectDir);
  writeAllAgentConfigs(dist);
  const packageJSON = await exportPackageFromWorkspace(projectDir);
  await writeFile(`${dist}/.npmrc`, `registry=${__ELEMENTS_REGISTRY_URL__}/`);
  await writeFile(`${dist}/package.json`, JSON.stringify(packageJSON, undefined, 2));
  await zipProject(dist);
}

/* istanbul ignore next -- @preserve */
async function zipProject(outDir: string) {
  const output = createWriteStream(`${outDir}.zip`);
  output.on('error', err => console.error('Error writing to zip file:', err));

  const archive = archiver('zip', { zlib: { level: 9 } });
  archive.pipe(output);
  archive.directory(outDir, false);
  await archive.finalize();

  rmSync(outDir, { recursive: true });
}

/* istanbul ignore next -- @preserve */
function copyProject(projectDir: string) {
  const ignoreDirs = new Set(['dist', 'node_modules', '.wireit']);
  cpSync(projectDir, `dist/${projectDir}`, {
    recursive: true,
    filter: src => !ignoreDirs.has(basename(src))
  });
}

/* istanbul ignore next -- @preserve */
async function exportPackageFromWorkspace(projectDir: string) {
  const REPO_WORKSPACE_DIR = '../../';
  const workspace = await readWorkspaceManifest(REPO_WORKSPACE_DIR);
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
    const archivePath = `${outDir}/${starter}.zip`;
    const extractedPath = `${outDir}/${starter}`;
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

/* istanbul ignore next -- @preserve */
export async function downloadStarter(starterPath: string, outPath: string) {
  console.log('⏳ Downloading starter...');
  const response = await fetch(starterPath);
  const blob = await response.blob();
  const arrayBuffer = await blob.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  writeFileSync(outPath, buffer);
}

/* istanbul ignore next -- @preserve */
export async function extractStarter(archivePath: string, outDir: string) {
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
      const child = exec(`cd ${extractedDir} && git init`);
      child.on('close', code => (code === 0 ? resolve() : reject(new Error(`git init exited with code ${code}`))));
      child.on('error', reject);
    });
  } else {
    console.log('🔄 Skipping git initialization...');
  }
}

/* istanbul ignore next -- @preserve */
export function isGitRepository(directoryPath: string) {
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
async function setupStarterNPM(extractedDir: string) {
  const npmClient = await getNPMClient();
  try {
    await installFromRegistry(extractedDir);
  } catch {
    try {
      await loginRegistry(extractedDir);
      await installFromRegistry(extractedDir);
    } catch (e) {
      const stderr = (e as { stderr?: Buffer })?.stderr?.toString?.().trim();
      console.error(stderr || e);
      console.error(
        `⚠️ Error installing dependencies, in the "${extractedDir}" directory run "${npmClient} login" then "${npmClient} install"`
      );
    }
  }
}

/* istanbul ignore next -- @preserve */
async function loginRegistry(extractedDir: string) {
  const npmClient = await getNPMClient();
  console.log('🔒 Logging in to registry...');
  execSync(`cd ${extractedDir} && ${npmClient} login`, {
    stdio: 'inherit'
  });
}

/* istanbul ignore next -- @preserve */
async function installFromRegistry(extractedDir: string) {
  const npmClient = await getNPMClient();
  console.log('📦 Installing dependencies...');
  await new Promise<void>((resolve, reject) => {
    const child = exec(`cd ${extractedDir} && ${npmClient} install`);
    child.on('close', code =>
      code === 0 ? resolve() : reject(new Error(`${npmClient} install exited with code ${code}`))
    );
    child.on('error', reject);
  });
}

/* istanbul ignore next -- @preserve */
export async function startStarter(extractedPath: string) {
  const npmClient = await getNPMClient();
  if (npmClient) {
    console.log('🚀 Starting project...');

    try {
      execSync(`cd ${extractedPath} && ${npmClient} run dev`, {
        stdio: 'inherit'
      });
    } catch (e) {
      if (e instanceof Error && 'signal' in e && e.signal === 'SIGINT') {
        console.log('\n👋 Stopped.');
        return;
      }
      console.error(e);
    }
  }
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
      'mcp__elements__playground_validate',
      'mcp__elements__playground_create',
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
