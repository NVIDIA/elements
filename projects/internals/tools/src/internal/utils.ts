import type { MetadataSummary } from '@internals/metadata';

export type ELEMENTS_ENV = 'mcp' | 'cli' | 'browser' | 'docs';

export const ELEMENTS_ENV_ICON = {
  mcp: '🤖',
  cli: '💻',
  browser: '🌐',
  docs: '📖'
} as const;

export function fuzzyMatch(search: string, candidates: string[]) {
  const words = search
    .toLowerCase()
    .split(/[^a-z0-9\-]+/)
    .filter(w => w.length > 2);

  return candidates.filter(candidate => {
    const candidateParts = new Set(
      candidate
        .toLowerCase()
        .split(/[\/-]/)
        .filter(i => i !== 'nve')
    );
    return words.some(word => {
      return word.split(/[\/-]/).some(item => candidateParts.has(item));
    });
  });
}

export function searchPackageNames(query: string, metadata: MetadataSummary): string[] {
  return fuzzyMatch(query, getPackageNames(metadata));
}

export function getPackageNames(metadata: MetadataSummary) {
  return Object.keys(metadata.projects).filter(i => i.startsWith('@nve'));
}

export function getCoverageSummaries(
  metadata: MetadataSummary
): Record<string, { total: number; lines: number; statements: number; functions: number; branches: number }> {
  return getPackageNames(metadata).reduce((results, project) => {
    const coverage = metadata.projects[project].tests.coverageTotal;
    const summary = {
      total: coverage.branches.pct,
      lines: coverage.lines.pct,
      statements: coverage.statements.pct,
      functions: coverage.functions.pct,
      branches: coverage.branches.pct
    };
    return { ...results, [project]: summary };
  }, {});
}

export function getAvailableElementTags(metadata: MetadataSummary) {
  return Object.values(metadata.projects)
    .flatMap(i => (i.elements.length ? i.elements : []))
    .filter(e => e.manifest?.deprecated !== 'true')
    .map(e => e.name);
}

export function getElementImports(html: string, metadata: MetadataSummary, lazy = false) {
  const IMPORTS = [
    ...(metadata.projects['@nvidia-elements/core']?.elements ?? []),
    ...(metadata.projects['@nvidia-elements/monaco']?.elements ?? []),
    ...(metadata.projects['@nvidia-elements/code']?.elements ?? []),
    ...(metadata.projects['@nvidia-elements/markdown']?.elements ?? [])
  ]
    .filter(element => html?.includes(`<${element.name}`))
    .filter(element => element.manifest?.deprecated !== 'true' && element.manifest?.metadata.entrypoint)
    .map(element => {
      const path = `${element.manifest.metadata.entrypoint}/define.js`;
      return lazy ? `import('${path}');` : `import '${path}';`;
    });

  const ELEMENTS_CODE_IMPORTS = html.includes('nve-codeblock')
    ? [
        `import '@nvidia-elements/code/codeblock/languages/html.js';`,
        `import '@nvidia-elements/code/codeblock/languages/css.js';`,
        `import '@nvidia-elements/code/codeblock/languages/json.js';`,
        `import '@nvidia-elements/code/codeblock/languages/javascript.js';`,
        `import '@nvidia-elements/code/codeblock/languages/typescript.js';`,
        `import '@nvidia-elements/code/codeblock/define.js';`
      ]
    : [];

  return [...IMPORTS, ...ELEMENTS_CODE_IMPORTS];
}
