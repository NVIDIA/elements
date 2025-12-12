import { ExamplesService, type Example } from '@nve-internals/metadata';

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
    .map(s => ({ id: s.id, name: s.name, summary: s.summary ? s.summary : s.description, element: s.element ?? '' }));
  return format === 'markdown' ? result.map(e => renderExampleHeaderMarkdown(e)).join('\n\n---\n\n') : result;
}

export async function searchPublicExamples(
  query: string,
  config: { format: 'markdown' | 'json'; limit?: number } = { format: 'markdown', limit: 100 }
) {
  const data = (await ExamplesService.search(query)).filter(isPublicExample);
  const result = data.slice(0, config.limit);
  return config.format === 'markdown' ? result.map(e => renderExampleMarkdown(e)).join('\n\n---\n\n') : result;
}

export function renderExampleMarkdown(example: Partial<Example>) {
  return `${renderExampleHeaderMarkdown(example)}${example.template ? `\n\n` : ''}${example.template ? `\`\`\`html\n${example.template.trim()}\n\`\`\`` : ''}`;
}

export function renderExampleHeaderMarkdown(example: Partial<Example>) {
  const content = example.summary ? example.summary : example.description;
  const formattedContent = content ? `${wrapText(content)}` : '';
  return `## ${example.name.replace(/([A-Z])/g, ' $1').trim()} (${example.id})${formattedContent ? '\n\n' : ''}${formattedContent}`;
}

export function wrapText(text = '', width = 80) {
  return text
    .split('\n')
    .map(line => {
      if (line.length <= width) return line;

      const lines: string[] = [];
      let currentLine = '';

      for (const word of line.split(' ')) {
        if (currentLine.length + word.length + 1 <= width) {
          currentLine += (currentLine ? ' ' : '') + word;
        } else {
          if (currentLine) {
            lines.push(currentLine);
            currentLine = word;
          } else {
            lines.push(word);
          }
        }
      }

      if (currentLine) {
        lines.push(currentLine);
      }

      return lines.join('\n');
    })
    .join('\n');
}
