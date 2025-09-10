import { dirname, join, parse, resolve } from 'node:path';
import { execSync } from 'node:child_process';
import { cwd } from 'node:process';
import { writeFile } from 'fs/promises';
import { mkdirSync, existsSync, unlinkSync, writeFileSync, cpSync, createWriteStream, rmSync } from 'fs';
import { readWorkspaceManifest } from '@pnpm/workspace.read-manifest';
import { getCatalogsFromWorkspaceManifest } from '@pnpm/catalogs.config';
import { createExportableManifest } from '@pnpm/exportable-manifest';
import { readProjectManifestOnly } from '@pnpm/read-project-manifest';
import { glob } from 'glob';
import archiver from 'archiver';
import AdmZip from 'adm-zip';
import { isCommandAvailable, getNPMClient } from '../internal/node.js';

export type Starter =
  | 'angular'
  | 'react'
  | 'lit'
  | 'preact'
  | 'solidjs'
  | 'svelte'
  | 'vue'
  | 'nextjs'
  | 'typescript'
  | 'go'
  | 'importmaps'
  | 'bundles'
  | 'extensions';

export const startersData = {
  typescript: {
    zip: 'https://NVIDIA.github.io/elements/starters/download/typescript.zip',
    cli: true
  },
  eleventy: {
    zip: 'https://NVIDIA.github.io/elements/starters/download/eleventy.zip',
    cli: true
  },
  go: {
    zip: 'https://NVIDIA.github.io/elements/starters/download/go.zip',
    cli: true
  },
  angular: {
    zip: 'https://NVIDIA.github.io/elements/starters/download/angular.zip',
    cli: true
  },
  react: {
    zip: 'https://NVIDIA.github.io/elements/starters/download/react.zip',
    cli: true
  },
  vue: {
    zip: 'https://NVIDIA.github.io/elements/starters/download/vue.zip',
    cli: true
  },
  nextjs: {
    zip: 'https://NVIDIA.github.io/elements/starters/download/nextjs.zip',
    cli: true
  },
  solidjs: {
    zip: 'https://NVIDIA.github.io/elements/starters/download/solidjs.zip',
    cli: true
  },
  svelte: {
    zip: 'https://NVIDIA.github.io/elements/starters/download/svelte.zip',
    cli: true
  },
  importmaps: {
    zip: 'https://NVIDIA.github.io/elements/starters/download/importmaps.zip',
    cli: false
  },
  lit: {
    zip: null,
    cli: false
  },
  preact: {
    zip: null,
    cli: false
  },
  bundles: {
    zip: 'https://NVIDIA.github.io/elements/starters/download/bundles.zip',
    cli: false
  },
  extensions: {
    zip: 'https://NVIDIA.github.io/elements/starters/download/scoped-registry.zip',
    cli: false
  }
};

/* istanbul ignore next -- @preserve */
export async function archiveStarter(projectDir, outDir) {
  await copyProject(projectDir);
  const packageJSON = await exportPackageFromWorkspace(projectDir);
  await writeFile(
    `${`${outDir}/${projectDir}`}/.npmrc`,
    'registry=https://registry.npmjs.org'
  );
  await writeFile(`${`${outDir}/${projectDir}`}/package.json`, JSON.stringify(packageJSON, undefined, 2));
  await zipProject(`${outDir}/${projectDir}`);
}

/* istanbul ignore next -- @preserve */
async function zipProject(outDir) {
  const output = createWriteStream(`${outDir}.zip`);
  output.on('error', err => console.error('Error writing to zip file:', err));

  const archive = archiver('zip', { zlib: { level: 9 } });
  archive.pipe(output);
  archive.directory(outDir, false);
  await archive.finalize();

  rmSync(outDir, { recursive: true });
}

/* istanbul ignore next -- @preserve */
async function copyProject(projectDir) {
  if (!existsSync(`dist/${projectDir}`)) {
    mkdirSync(`dist/${projectDir}`, { recursive: true });
  }

  const files = await glob(`./${projectDir}/**/*`, {
    dot: true,
    ignore: ['**/dist/**', '**/node_modules/**', '**/.wireit/**']
  });
  files.forEach(file => cpSync(file, `dist/${projectDir}${file.replace(projectDir, '')}`, { recursive: true }));
}

/* istanbul ignore next -- @preserve */
async function exportPackageFromWorkspace(projectDir) {
  const REPO_WORKSPACE_DIR = '../../';
  const workspace = await readWorkspaceManifest(REPO_WORKSPACE_DIR);
  const catalogs = getCatalogsFromWorkspaceManifest(workspace);
  const manifest = await readProjectManifestOnly(projectDir);
  let exportable = await createExportableManifest(projectDir, manifest, { catalogs });
  exportable = removeWireitScripts(exportable);
  exportable.packageManager = 'pnpm@10.6.2';
  return exportable;
}

export function removeWireitScripts(exportable) {
  Object.keys(exportable.scripts)
    .filter(key => exportable.scripts[key] === 'wireit' && exportable.wireit[key])
    .forEach(key => {
      exportable.scripts[key] = exportable.wireit[key].command;

      if (exportable.scripts[key] && exportable.scripts[key].match(/playwright-lock '(.*?)'/g)) {
        exportable.scripts[key] = exportable.scripts[key]
          .match(/playwright-lock '(.*?)'/g)[0]
          .replace('playwright-lock', '')
          .replaceAll(`'`, '')
          .trim();
      }
    });
  exportable.wireit = undefined;
  return exportable;
}

/* istanbul ignore next -- @preserve */
export async function createStarter(starter: Starter, outDir: string = resolve(cwd())) {
  const downloadPath = startersData[starter].zip;
  const archivePath = `${outDir}/${starter}.zip`;
  const extractedPath = `${outDir}/${starter}`;
  await downloadStarter(downloadPath, archivePath);
  await extractStarter(archivePath, extractedPath);
  await setupStarterGit(extractedPath);
  await setupStarterNPM(extractedPath);
  console.log('🎉 Starter created successfully');
  return extractedPath;
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
    execSync(`cd ${extractedDir} && git init`, {
      stdio: 'inherit'
    });
  } else {
    console.log('🔄 Skipping git initialization...');
  }
}

/* istanbul ignore next -- @preserve */
export function isGitRepository(directoryPath) {
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
      console.error(e);
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
  execSync(`cd ${extractedDir} && ${npmClient} install`, {
    stdio: 'inherit'
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
      console.error(e);
    }
  }
}
