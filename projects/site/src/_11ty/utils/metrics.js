// @ts-check

/**
 * @param {Record<string, {unit: {numPassedTests: number}, axe: {numPassedTests: number}, visual: {numPassedTests: number}, ssr: {numPassedTests: number}, lighthouse: {testResults: unknown[]}}>} projects
 */
export function getTotalTests(projects) {
  return Object.values(projects).reduce(
    (total, project) =>
      total +
      project.unit.numPassedTests +
      project.axe.numPassedTests +
      project.visual.numPassedTests +
      project.ssr.numPassedTests +
      project.lighthouse.testResults.length,
    0
  );
}

/**
 * @param {Pick<import('@internals/metadata').Project, 'name' | 'version' | 'private'>[]} projects
 */
export function getPackageCount(projects) {
  const packages = new Set(
    projects
      .filter(
        project => project.name.startsWith('@nvidia-elements/') && !project.private && project.version !== '0.0.0'
      )
      .map(project => project.name)
  );
  return packages.size;
}

/** @param {(Pick<import('@internals/metadata').Example, 'id' | 'entrypoint' | 'deprecated'> & {tags?: string[]})[]} examples */
export function getPatternCount(examples) {
  return new Set(
    examples
      .filter(
        example =>
          example.entrypoint?.startsWith('@internals/patterns/') &&
          !example.deprecated &&
          !example.tags?.some(tag => tag === 'test-case' || tag === 'performance' || tag === 'template')
      )
      .map(example => example.id)
  ).size;
}
