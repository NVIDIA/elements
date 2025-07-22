import type { MetadataCustomElementsManifestDeclaration } from '../types.js';

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
