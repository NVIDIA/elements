import { writeFileSync } from 'node:fs';
import { getProjects } from './elements.utils.ts';

const projects = await getProjects();
const created = new Date().toISOString();

writeFileSync('./static/elements.json', JSON.stringify({ created, projects }, null, 2));

console.log('✅ Maglev metadata generated successfully.');
