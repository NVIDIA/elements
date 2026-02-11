import { ExamplesService, type Example } from '@internals/metadata';
import { wrapText } from '../internal/utils.js';

export function isPublicExample(example: Example) {
  return (
    !example.deprecated &&
    !example.id.toLowerCase().includes('theme') &&
    !example.id.toLowerCase().includes('internal') &&
    !example.tags.includes('anti-pattern') &&
    !example.tags.includes('performance') &&
    !example.tags.includes('test-case') &&
    !example.element?.includes('internal') &&
    !example.element?.includes('responsive')
  );
}

export function getPublicExamples(format: 'markdown' | 'json', examples: Partial<Example>[]) {
  const result = examples
    .filter(isPublicExample)
    .reverse()
    .map(s => ({ id: s.id, name: s.name, summary: s.summary ? s.summary : s.description, element: s.element ?? '' }));
  return format === 'markdown'
    ? result
        .filter(example => example.summary)
        .map(example => {
          return `- **${example.id.replace('elements-', '')}** ${wrapText(example.summary)}`;
        })
        .join('\n')
    : result;
}

export async function searchPublicExamples(
  query: string,
  config: { format: 'markdown' | 'json'; limit?: number } = { format: 'markdown', limit: 100 }
) {
  const data = (await ExamplesService.search(query)).filter(isPublicExample);
  const result = data.slice(0, config.limit);

  if (result.length === 0) {
    const message = `No examples found matching "${query}".\n\nTip: Try searching for common patterns like "form", "validation", "layout", "navigation", "button", or specific component names like "nve-grid", "nve-dropdown".`;
    return config.format === 'markdown' ? message : result;
  }

  return config.format === 'markdown' ? result.map(e => renderExampleMarkdown(e)).join('\n') : result;
}

export function renderExampleMarkdown(example: Partial<Example>) {
  return `${renderExampleHeaderMarkdown(example)}${example.template ? `\n\n` : ''}${example.template ? `\`\`\`html\n${example.template.trim()}\n\`\`\`` : ''}`;
}

export function renderExampleHeaderMarkdown(example: Partial<Example>) {
  const content = example.summary ? example.summary : example.description;
  const formattedContent = content ? `${wrapText(content)}` : '';
  return `## ${example.name.replace(/([A-Z])/g, ' $1').trim()} (${example.id})${formattedContent ? '\n\n' : ''}${formattedContent}`;
}
