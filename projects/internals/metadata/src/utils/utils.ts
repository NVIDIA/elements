import type { MetadataCustomElementsManifestDeclaration, MetadataSummary } from '../types.js';

/**
 * Given a query, returns the tags that match the query
 */
export function searchTagNames(query: string, metadata: MetadataSummary): string[] {
  const elements = Object.values(metadata.projects)
    .filter(i => i.elements)
    .flatMap(i => i.elements);
  return fuzzyMatch(
    query,
    elements.map(e => e.name)
  );
}

function fuzzyMatch(search: string, candidates: string[]) {
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

export function searchPublishedPackageNames(query: string, metadata: MetadataSummary): string[] {
  const packages = getPublishedPackageNames(metadata);
  const matches = fuzzyMatch(query, packages);
  return matches.length ? matches : packages;
}

export function getPackageNames(metadata: MetadataSummary) {
  return Object.keys(metadata.projects).filter(i => i.startsWith('@nve'));
}

export function getPublishedPackageNames(metadata: MetadataSummary) {
  return Object.keys(metadata.projects).filter(
    i => i.startsWith('@nve') && !i.startsWith('@nve-internals') && metadata.projects[i].version !== '0.0.0'
  );
}

export function getChangelogs(metadata: MetadataSummary) {
  return Object.keys(metadata.projects).reduce((results, project) => {
    return { ...results, [project]: metadata.projects[project].changelog };
  }, {});
}

export function searchChangelogs(query: string, metadata: MetadataSummary) {
  const changelogs = getChangelogs(metadata);
  const matches = fuzzyMatch(query, Object.keys(changelogs));
  return Object.fromEntries(
    Object.entries(changelogs).filter(([key]) => (matches.length ? matches.includes(key) : true))
  );
}

export function searchElementsAPIsMarkdown(query: string, metadata: MetadataSummary) {
  const matches = new Set(searchTagNames(query, metadata));
  return Object.values(metadata.projects)
    .flatMap(i => (i.elements.length ? i.elements : []))
    .filter(e => matches.has(e.name))
    .map(e => e.markdown);
}

export function getCoverageSummaries(metadata: MetadataSummary) {
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

export function getAvailableElementsAPIs(
  metadata: MetadataSummary
): { name: string; description: string; usage?: string }[] {
  return Object.values(metadata.projects)
    .flatMap(i => (i.elements.length ? i.elements : []))
    .filter(e => e.manifest?.deprecated !== 'true' && e.manifest.description)
    .map(e => ({ name: e.name, description: e.manifest.description }));
}

export function getAvailableElementTags(metadata: MetadataSummary) {
  return Object.values(metadata.projects)
    .flatMap(i => (i.elements.length ? i.elements : []))
    .filter(e => e.manifest?.deprecated !== 'true')
    .map(e => e.name);
}

/* istanbul ignore next -- @preserve */
let versions: Record<string, string> = null;
/* istanbul ignore next -- @preserve */
export async function getLatestPublishedVersions(metadata: MetadataSummary) {
  if (!versions) {
    const names = getPublishedPackageNames(metadata);
    const packageFile = await Promise.all(
      names
        .map(name => `https://esm.nvidia.com/${name}@latest/package.json`)
        .map(url => {
          const controller = new AbortController();
          const timeout = setTimeout(() => controller.abort(), 3000);
          return fetch(url, { signal: controller.signal })
            .then(res => {
              clearTimeout(timeout);
              return res.json();
            })
            .catch(() => {
              console.warn('Could not fetch latest version from https://esm.nvidia.com');
              return '0.0.0';
            });
        })
    );
    versions = packageFile.reduce((acc: Record<string, string>, pkg) => ({ ...acc, [pkg.name]: pkg.version }), {});
  }
  return versions;
}

export function getElementImports(html: string, metadata: MetadataSummary, lazy = false) {
  const IMPORTS = [...metadata.projects['@nvidia-elements/core'].elements, ...metadata.projects['@nvidia-elements/monaco'].elements]
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
        `import '@nvidia-elements/code/codeblock/languages/typescript.js';`,
        `import '@nvidia-elements/code/codeblock/define.js';`
      ]
    : [];

  return [...IMPORTS, ...ELEMENTS_CODE_IMPORTS];
}

export function changelogMarkdownToJSON(changelog: string) {
  return changelog
    .split('## [')
    .map(release => `## [${release}`)
    .map(releaseString => {
      const title = releaseString.split('\n')[0].replace('## [', '[');
      const releaseBody = releaseString.split('\n').slice(1).join('\n');
      const bugFixes = releaseBody.includes('### Bug Fixes')
        ? releaseBody
            .split('### Bug Fixes')[1]
            ?.trim()
            ?.split('\n')
            .map(line => line.trim())
        : [];
      const features = releaseBody.includes('### Features')
        ? releaseBody
            .split('### Features')[1]
            ?.trim()
            ?.split('\n')
            .map(line => line.trim())
        : [];
      const breakingChanges = releaseBody.includes('### Breaking Changes')
        ? releaseBody
            .split('### Breaking Changes')[1]
            ?.trim()
            ?.split('\n')
            .map(line => line.trim())
        : [];
      return { title, bugFixes, features, breakingChanges };
    });
}

export function getElementChangelog(name: string, changelog: string) {
  const changelogJSON = changelogMarkdownToJSON(changelog);
  const elementChangelog = changelogJSON
    .map(release => {
      release.bugFixes =
        release.bugFixes.filter(bugFix => bugFix.includes(name) || bugFix.includes(name.replace('nve-', ''))) || [];
      release.features =
        release.features.filter(feature => feature.includes(name) || feature.includes(name.replace('nve-', ''))) || [];
      release.breakingChanges =
        release.breakingChanges.filter(
          breakingChange => breakingChange.includes(name) || breakingChange.includes(name.replace('nve-', ''))
        ) || [];
      return release;
    })
    .filter(
      release => release.bugFixes.length > 0 || release.features.length > 0 || release.breakingChanges.length > 0
    );

  const releasesMarkdown = elementChangelog.map(release => {
    const features = release.features.length > 0 ? `\n\n### Features\n${release.features.join('\n')}` : '';
    const breakingChanges =
      release.breakingChanges.length > 0 ? `\n\n### Breaking Changes\n${release.breakingChanges.join('\n')}` : '';
    const bugFixes = release.bugFixes.length > 0 ? `\n\n### Bug Fixes\n${release.bugFixes.join('\n')}` : '';
    return `## ${release.title}${features}${breakingChanges}${bugFixes}`;
  });

  return `# Changelog - ${name}\n\n${releasesMarkdown.join('\n\n')}`;
}

export function elementMetadataToMarkdown(manifest: MetadataCustomElementsManifestDeclaration) {
  if (manifest.tagName) {
    return `
## ${manifest.tagName}
${manifest.description ? `\n${manifest.description}` : ''}

### Example

${manifest.metadata.example ? `\`\`\`html\n${manifest.metadata.example}\n\`\`\`` : 'No example available.'}

### Import

\`\`\`javascript
import '${manifest.metadata.entrypoint}/define.js';
\`\`\`

### Slots
${
  manifest.slots
    ? `
| name | description |
| ---- | ----------- |
${manifest.slots.map(i => `| ${i.name} | ${i.description} |`).join('\n')}`
    : 'No slots available.'
}

### Attributes
${
  manifest.attributes?.length
    ? `
| name | value | description |
| ---- | ----- | ----------- |
${manifest.attributes
  .map(i => {
    const type = i.type?.text ? i.type.text.replace(/\|/g, '\\|').split('\n').join('') : '';
    const description = i.description?.replace(/\|/g, '\\|')?.split('\n')?.join('');
    return `| ${i.name} | \`${type}\` | ${description} |`;
  })
  .join('\n')}`
    : 'No Attributes available.'
}

### Properties
${
  manifest.attributes?.length
    ? `
| name | value | description |
| ---- | ----- | ----------- |
${manifest.members
  .map(i => {
    const type = i.type?.text ? i.type.text.replace(/\|/g, '\\|').split('\n').join('') : '';
    const description = i.description ? i.description.replace(/\|/g, '\\|').split('\n').join('') : '';
    return `| ${i.name} | \`${type}\` | ${description ?? ''} |`;
  })
  .join('\n')}`
    : 'No Properties available.'
}

### Events
${
  manifest.events?.length
    ? `
| name | description |
| ---- | ----------- |
${manifest.events
  .map(i => {
    const description = i.description ? i.description.replace(/\|/g, '\\|').split('\n').join('') : '';
    return `| ${i.name} | ${description ?? ''} |`;
  })
  .join('\n')}`
    : 'No Custom Events available.'
}

### CSS Properties
${
  manifest.cssProperties?.length
    ? `
| name | description |
| ---- | ----------- |
${manifest.cssProperties.map(i => `| ${i.name} | ${i.description ?? ''} |`).join('\n')}`
    : 'No CSS Properties available.'
}`.trim();
  }
}
