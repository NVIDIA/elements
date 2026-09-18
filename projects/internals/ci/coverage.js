import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createCoverageMap } from '@vitest/istanbul-lib-coverage';
import { create, createContext } from '@vitest/istanbul-lib-report';
import { COVERAGE_PROJECTS } from './coverage-projects.js';

const PROJECTS_ROOT = path.resolve(import.meta.dirname, '../..');
const REPOSITORY_ROOT = path.resolve(PROJECTS_ROOT, '..');
const OUTPUT_DIRECTORY = path.resolve(import.meta.dirname, 'coverage');

function readCoverageReport(project, projectsRoot) {
  const reportPath = path.join(projectsRoot, project.dir, 'coverage/unit/coverage-final.json');

  try {
    return JSON.parse(readFileSync(reportPath, 'utf-8'));
  } catch (error) {
    throw new Error(`Unable to read coverage for ${project.name} at ${reportPath}`, { cause: error });
  }
}

function assertRepositoryPaths(coverageMap, repositoryRoot) {
  for (const filename of coverageMap.files()) {
    const relative = path.relative(repositoryRoot, filename);
    if (relative === '..' || relative.startsWith(`..${path.sep}`) || path.isAbsolute(relative)) {
      throw new Error(`Coverage file is outside the repository: ${filename}`);
    }
  }
}

export function generateCoverageReport({
  projects = COVERAGE_PROJECTS,
  projectsRoot = PROJECTS_ROOT,
  repositoryRoot = REPOSITORY_ROOT,
  outputDirectory = OUTPUT_DIRECTORY,
  outputFile = 'cobertura.xml'
} = {}) {
  const coverageMap = createCoverageMap({});

  for (const project of projects) {
    try {
      coverageMap.merge(readCoverageReport(project, projectsRoot));
    } catch (error) {
      if (error.message.startsWith('Unable to read coverage')) throw error;
      throw new Error(`Unable to merge coverage for ${project.name}`, { cause: error });
    }
  }

  assertRepositoryPaths(coverageMap, repositoryRoot);

  const summary = coverageMap.getCoverageSummary();
  if (summary.lines.total === 0) throw new Error('Coverage report does not contain any source lines');

  const context = createContext({ dir: outputDirectory, coverageMap });
  create('cobertura', { file: outputFile, projectRoot: repositoryRoot }).execute(context);

  return summary.toJSON();
}

if (path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const summary = generateCoverageReport();
  console.log(`Generated ${path.join(OUTPUT_DIRECTORY, 'cobertura.xml')} (${summary.lines.pct}% line coverage)`);
}
