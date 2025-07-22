import { MetadataService, type MetadataStory } from '@internals/metadata';

export async function searchExampleStories(query: string) {
  const stories = await MetadataService.getStories();

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
  const scored = stories.map(story => {
    let score = 0;
    for (const word of q.split(/\s+/).filter(Boolean)) {
      if (story.element.toLowerCase().includes(word)) score += 4;
      if (story.description.toLowerCase().includes(word)) score += 3;
      if (
        story.id
          .split(/(?=[A-Z])/)
          .join(' ')
          .toLowerCase()
          .includes(word)
      )
        score += 2;
      if (story.template.toLowerCase().includes(word)) score += 1;
    }
    return { ...story, _score: score };
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

export function getExampleStoriesMarkdown(stories: MetadataStory[]) {
  return stories
    .map(s => {
      const description = s.description ? `${s.description}\n\n` : '';
      const template = s.template ? `\`\`\`html\n${s.template}\`\`\`` : '';
      const id = s.id.split(/(?=[A-Z])/).join(' ');
      return `## ${id} - ${s.element}\n\n${description}${template}`;
    })
    .join('\n\n---\n\n');
}
