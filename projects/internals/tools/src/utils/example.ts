import type { MetadataSummary } from '@nve-internals/metadata';

export interface StoryExample {
  id: string;
  description: string;
  entrypoint: string;
  element: string;
  project: string;
  template?: string;
  usage?: string;
}

export async function searchExampleStories(query: string, data: MetadataSummary) {
  const stories = await getAllExampleStories(data);

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

export function getAllExampleStories(data: MetadataSummary) {
  return Object.entries(data.projects)
    .flatMap(([_, project]) => {
      return project.elements.flatMap(element => {
        const stories = element.stories?.items ?? [];
        return stories.map(s => ({
          id: s.id,
          description: s.description,
          template: s.template,
          element: element.name,
          project: project.name,
          entrypoint: element.stories?.entrypoint
        }));
      });
    })
    .sort((a, b) => a.entrypoint.localeCompare(b.entrypoint));
}

export function getExampleStoriesMarkdown(stories: StoryExample[]) {
  return stories
    .map(s => {
      const description = s.description ? `${s.description}\n\n` : '';
      const template = s.template ? `\`\`\`html\n${s.template}\`\`\`` : '';
      const id = s.id.split(/(?=[A-Z])/).join(' ');
      return `## ${id} - ${s.element}\n\n${description}${template}`;
    })
    .join('\n\n---\n\n');
}
