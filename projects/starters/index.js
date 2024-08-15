import { writeFile } from 'fs/promises';
import { mkdirSync, existsSync, cpSync, createWriteStream, rmSync, readdirSync } from 'fs';
import { getCatalogsFromWorkspaceManifest } from '@pnpm/catalogs.config';
import { createExportableManifest } from '@pnpm/exportable-manifest';
import { readProjectManifestOnly } from '@pnpm/read-project-manifest';
import { readWorkspaceManifest } from '@pnpm/workspace.read-manifest';
import { glob } from 'glob';
import archiver from 'archiver';

/**
 * Export starters
 * - clean up package.json files to be externalized from pnpm workspace
 * - inline wireit scripts
 * - zip compress for easy download
 */
const dirs = readdirSync('./', { withFileTypes: true });
for (const dir of dirs) {
  if (dir.isDirectory() && dir.name !== 'dist' && dir.name !== 'node_modules' && dir.name !== '.wireit') {
    await copyProject(dir.name);
    await exportPackageFromWorkspace(dir.name);
    await zipProject(`dist/${dir.name}`);
  }
}

async function zipProject(outDir) {
  const output = createWriteStream(`${outDir}.zip`);
  output.on('error', err => console.error('Error writing to zip file:', err));

  const archive = archiver('zip', { zlib: { level: 9 } });
  archive.pipe(output);
  archive.directory(outDir, false);
  await archive.finalize();

  rmSync(outDir, { recursive: true });
}

async function exportPackageFromWorkspace(projectDir) {
  const REPO_WORKSPACE_DIR = '../../';
  const workspace = await readWorkspaceManifest(REPO_WORKSPACE_DIR);
  const catalogs = getCatalogsFromWorkspaceManifest(workspace);
  const manifest = await readProjectManifestOnly(projectDir);
  let exportable = await createExportableManifest(projectDir, manifest, { catalogs });
  exportable = extractWireitScripts(exportable);
  await writeFile(`${`dist/${projectDir}`}/package.json`, JSON.stringify(exportable, undefined, 2));
}

function extractWireitScripts(exportable) {
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

async function copyProject(projectDir) {
  if (!existsSync(`dist/${projectDir}`)) {
    mkdirSync(`dist/${projectDir}`, { recursive: true });
  }

  const files = await glob(`./${projectDir}/**/*.*`, { ignore: ['**/dist/**', '**/node_modules/**', '**/.wireit/**'] });
  files.forEach(file => cpSync(file, `dist/${projectDir}${file.replace(projectDir, '')}`, { recursive: true }));
}
