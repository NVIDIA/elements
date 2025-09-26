import { type MetadataExample } from '@nve-internals/metadata';

export function isValidExample(example: MetadataExample) {
  return (
    !example.deprecated &&
    !example.id.toLowerCase().includes('theme') &&
    !example.tags.includes('anti-pattern') &&
    !example.tags.includes('performance') &&
    !example.tags.includes('test-case') &&
    !example.element?.includes('internal')
  );
}

export function getAvailableExamples(format: 'markdown' | 'json', examples: Partial<MetadataExample>[]) {
  const result = examples
    .filter(isValidExample)
    .map(s => ({ id: s.id, summary: s.summary ? s.summary : s.description, element: s.element ?? '' }));
  return format === 'markdown' ? result.map(e => renderExampleHeaderMarkdown(e)).join('\n\n---\n\n') : result;
}

export async function searchExamples(query: string, format: 'markdown' | 'json', examples: MetadataExample[]) {
  const result = await filterExamples(query, examples);
  return format === 'markdown' ? result.map(e => renderExampleMarkdown(e)).join('\n\n---\n\n') : result;
}

export async function filterExamples(query: string, examples: MetadataExample[]) {
  // remove noise words
  const q = query
    .trim()
    .toLowerCase()
    .replaceAll('example', '')
    .replaceAll('examples', '')
    .replaceAll('story', '')
    .replaceAll('stories', '')
    .replaceAll('pattern', '')
    .replaceAll('patterns', '');

  // Assign a relevancy score based on matches in description, element, and id for each word
  const scored = examples.filter(isValidExample).map(example => {
    let score = 0;
    for (const word of q.split(/\s+/).filter(Boolean)) {
      if (example.id.toLowerCase() === word.toLowerCase()) score += 5;
      if (example.element?.toLowerCase().includes(word)) score += 4;
      if (example.summary.toLowerCase().includes(word)) score += 3;
      if (example.description.toLowerCase().includes(word)) score += 2;
      if (
        example.id.toLowerCase().includes(word) ||
        example.id
          .split(/(?=[A-Z])/)
          .join(' ')
          .toLowerCase()
          .includes(word)
      )
        score += 2;
      if (example.template.toLowerCase().includes(word)) score += 1;
    }
    return { ...example, _score: score };
  });

  // Filter out stories with no match
  const filtered = scored.filter(story => story._score > 0);

  // Sort by score descending, then by description length ascending (as a tiebreaker)
  filtered.sort((a, b) => {
    if (b._score !== a._score) return b._score - a._score;
    return a.description.length - b.description.length;
  });

  // Remove the _score property before returning
  const result = filtered.slice(0, 5).map(({ _score, ...rest }) => rest);

  return result;
}

export function renderExampleMarkdown(example: Partial<MetadataExample>) {
  return `${renderExampleHeaderMarkdown(example)}${example.template ? `\n\n` : ''}${example.template ? `\`\`\`html\n${example.template}\n\`\`\`` : ''}`;
}

export function renderExampleHeaderMarkdown(example: Partial<MetadataExample>) {
  const content = example.summary ? example.summary : example.description;
  const formattedContent = content ? `${wrapText(content)}` : '';
  return `## ${example.id}${example.element ? ` (${example.element}) ` : ''}${formattedContent ? '\n\n' : ''}${formattedContent}`;
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
