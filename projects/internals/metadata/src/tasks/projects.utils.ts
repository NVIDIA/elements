import { readFileSync, existsSync } from 'node:fs';
import type { Package, Project } from '../types.js';

function getPackageFile(basePath: string): Package {
  return JSON.parse(readFileSync(new URL(basePath + '/package.json', import.meta.url), 'utf8'));
}

function getChangelog(basePath: string): string {
  const changelog = existsSync(new URL(basePath + '/CHANGELOG.md', import.meta.url))
    ? readFileSync(new URL(basePath + '/CHANGELOG.md', import.meta.url), 'utf8')
    : '';
  return changelog.includes('@elements') ? (changelog.split('@elements')[0] ?? '') : changelog;
}

function getReadMe(basePath: string): string {
  return readFileSync(new URL(basePath + '/README.md', import.meta.url), 'utf8');
}

function getProjectMetadata(basePath: string): Project {
  const packageFile = getPackageFile(basePath);
  const changelog = getChangelog(basePath);
  const readme = getReadMe(basePath);

  return {
    name: packageFile.name,
    version: packageFile.version,
    description: packageFile.description,
    readme,
    changelog
  };
}

export function getProjects(): { created: string; data: Project[] } {
  const projects = [
    '../../../../create',
    '../../../../elements',
    '../../../../elements-react',
    '../../../../styles',
    '../../../../testing',
    '../../../../themes',
    '../../../../labs/behaviors-alpine',
    '../../../../labs/brand',
    '../../../../labs/code',
    '../../../../cli',
    '../../../../labs/lint',
    '../../../../forms',
    '../../../../labs/markdown',
    '../../../../labs/media',
    '../../../../labs/playwright-screencast',
    '../../../../monaco',
    '../../../../internals/metadata',
    '../../../../internals/patterns'
  ];

  return {
    created: new Date().toISOString(),
    data: projects.map(project => getProjectMetadata(project))
  };
}
