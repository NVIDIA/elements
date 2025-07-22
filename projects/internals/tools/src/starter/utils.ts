import { readWorkspaceManifest } from '@pnpm/workspace.read-manifest';
import { getCatalogsFromWorkspaceManifest } from '@pnpm/catalogs.config';
import { createExportableManifest } from '@pnpm/exportable-manifest';
import { readProjectManifestOnly } from '@pnpm/read-project-manifest';
import { mkdirSync, existsSync, cpSync, createWriteStream, rmSync } from 'fs';
import { writeFile } from 'fs/promises';
import { glob } from 'glob';
import archiver from 'archiver';

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

async function zipProject(outDir) {
  const output = createWriteStream(`${outDir}.zip`);
  output.on('error', err => console.error('Error writing to zip file:', err));

  const archive = archiver('zip', { zlib: { level: 9 } });
  archive.pipe(output);
  archive.directory(outDir, false);
  await archive.finalize();

  rmSync(outDir, { recursive: true });
}

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

function removeWireitScripts(exportable) {
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
