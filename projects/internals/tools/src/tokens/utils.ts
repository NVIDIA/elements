import type { MetadataSummary, MetadataToken } from '@internals/metadata';

export function getSemanticTokens(format: 'markdown' | 'json', metadata: MetadataSummary) {
  const tokens: MetadataToken[] = metadata.projects['@nvidia-elements/themes'].tokens
    .filter(
      token =>
        !token.name.includes('nve-config-') &&
        !token.name.includes('ref-color') &&
        !token.name.includes('ref-scale') &&
        !token.name.includes('ref-opacity') &&
        !token.name.includes('ref-outline') &&
        !token.name.includes('ref-font-family-') &&
        !token.name.includes('sys-color-scheme') &&
        !token.name.includes('sys-contrast') &&
        !token.name.includes('line-height') &&
        !token.name.includes('ratio') &&
        !token.name.includes('-xxx') &&
        !token.name.includes('-xx')
    )
    .sort((a, b) => a.name.localeCompare(b.name));

  if (format === 'markdown') {
    return `## CSS Variables\n\nAvailable semantic design tokens for theming.
| name     | value |
| -------- | ----- |
${tokens.map(token => `| ${token.name} | ${token.value} |`).join('\n')}`;
  } else if (format === 'json') {
    return tokens;
  }
}
