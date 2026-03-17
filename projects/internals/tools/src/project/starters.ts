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
import { skills } from '../context/index.js';
import type { Report } from '../internal/types.js';

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
    zip: 'https://NVIDIA.github.io/elements/starters/download/angular.zip',
    cli: true
  },
  bundles: {
    zip: 'https://NVIDIA.github.io/elements/starters/download/bundles.zip',
    cli: true
  },
  eleventy: {
    zip: 'https://NVIDIA.github.io/elements/starters/download/eleventy.zip',
    cli: true
  },
  extensions: {
    zip: 'https://NVIDIA.github.io/elements/starters/download/scoped-registry.zip',
    cli: false
  },
  go: {
    zip: 'https://NVIDIA.github.io/elements/starters/download/go.zip',
    cli: true
  },
  hugo: {
    zip: 'https://NVIDIA.github.io/elements/starters/download/hugo.zip',
    cli: true
  },
  importmaps: {
    zip: 'https://NVIDIA.github.io/elements/starters/download/importmaps.zip',
    cli: false
  },
  'lit-library': {
    zip: 'https://NVIDIA.github.io/elements/starters/download/lit-library.zip',
    cli: false
  },
  lit: {
    zip: null,
    cli: false
  },
  nextjs: {
    zip: 'https://NVIDIA.github.io/elements/starters/download/nextjs.zip',
    cli: true
  },
  nuxt: {
    zip: 'https://NVIDIA.github.io/elements/starters/download/nuxt.zip',
    cli: true
  },
  preact: {
    zip: null,
    cli: false
  },
  react: {
    zip: 'https://NVIDIA.github.io/elements/starters/download/react.zip',
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
  typescript: {
    zip: 'https://NVIDIA.github.io/elements/starters/download/typescript.zip',
    cli: true
  },
  vue: {
    zip: 'https://NVIDIA.github.io/elements/starters/download/vue.zip',
    cli: true
  }
};

/* istanbul ignore next -- @preserve */
export async function archiveStarter(projectDir: string, outDir: string) {
  await copyProject(projectDir);
  await createCursorConfig(projectDir);
  await createClaudeConfig(projectDir);
  await createVSCodeConfig(projectDir);
  await createCoreSkill(projectDir);
  const packageJSON = await exportPackageFromWorkspace(projectDir);
  await writeFile(
    `${`${outDir}/${projectDir}`}/.npmrc`,
    'registry=https://registry.npmjs.org'
  );
  await writeFile(`${`${outDir}/${projectDir}`}/package.json`, JSON.stringify(packageJSON, undefined, 2));
  await zipProject(`${outDir}/${projectDir}`);
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
async function copyProject(projectDir: string) {
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
async function createCursorConfig(projectDir: string) {
  const cursorConfig = {
    mcpServers: {
      elements: {
        description: 'NVIDIA Elements UI Design System (nve-*), custom element schemas, APIs and examples',
        command: 'npm',
        args: ['exec', '--package=@nvidia-elements/cli@latest', '-y', '--prefer-online', '--', 'nve', 'mcp'],
        env: {
          npm_config_registry: 'https://registry.npmjs.org'
        }
      }
    }
  };

  const dist = `dist/${projectDir}/.cursor`;
  if (!existsSync(dist)) {
    mkdirSync(dist, { recursive: true });
  }
  await writeFile(`${dist}/mcp.json`, JSON.stringify(cursorConfig, undefined, 2));
}

/* istanbul ignore next -- @preserve */
async function createClaudeConfig(projectDir: string) {
  const claudeMCPConfig = {
    mcpServers: {
      elements: {
        description: 'NVIDIA Elements UI Design System (nve-*), custom element schemas, APIs and examples',
        command: 'npm',
        args: ['exec', '--package=@nvidia-elements/cli@latest', '-y', '--prefer-online', '--', 'nve', 'mcp'],
        env: {
          npm_config_registry: 'https://registry.npmjs.org'
        }
      }
    }
  };

  const dist = `dist/${projectDir}/.claude`;
  if (!existsSync(dist)) {
    mkdirSync(dist, { recursive: true });
  }
  await writeFile(`${dist}/settings.json`, JSON.stringify(claudeProjectSettings, undefined, 2));
  await writeFile(`dist/${projectDir}/.mcp.json`, JSON.stringify(claudeMCPConfig, undefined, 2));
}

/* istanbul ignore next -- @preserve */
async function createVSCodeConfig(projectDir: string) {
  const vscodeConfig = {
    'html.customData': [
      './node_modules/@nvidia-elements/styles/dist/data.html.json',
      './node_modules/@nvidia-elements/core/dist/data.html.json',
      './node_modules/@nvidia-elements/monaco/dist/data.html.json',
      './node_modules/@nvidia-elements/code/dist/data.html.json',
      './node_modules/@nvidia-elements/markdown/dist/data.html.json'
    ]
  };

  const dist = `dist/${projectDir}/.vscode`;
  if (!existsSync(dist)) {
    mkdirSync(dist, { recursive: true });
  }
  await writeFile(`${dist}/settings.json`, JSON.stringify(vscodeConfig, undefined, 2));
}

/* istanbul ignore next -- @preserve */
export async function createCoreSkill(projectDir: string) {
  const skill = skills.find(skill => skill.name === 'elements');
  if (!skill) {
    throw new Error('Elements skill not found');
  }
  const dist = `dist/${projectDir}/.claude/skills/${skill.name}`;
  if (!existsSync(dist)) {
    mkdirSync(dist, { recursive: true });
  }
  await writeFile(
    `${dist}/SKILL.md`,
    `
---
name: ${skill.name}
title: ${skill.title}
description: ${skill.description}
---
${skill.context}`.trim()
  );
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
    execSync(`cd ${extractedDir} && git init`, { stdio: 'pipe' });
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
  execSync(`cd ${extractedDir} && ${npmClient} install`, { stdio: 'pipe' });
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
