import { writeFileSync } from 'node:fs';
import { getStories } from './stories.utils.ts';

const stories = await getStories();

writeFileSync('./static/stories.json', JSON.stringify(stories, null, 2));
console.log('✅ Stories generated successfully.');
