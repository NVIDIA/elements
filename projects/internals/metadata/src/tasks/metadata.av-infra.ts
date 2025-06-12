import { writeFileSync } from 'node:fs';
import { getProjects } from './metadata.av-infra.utils.ts';

const projects = await getProjects();
const created = new Date().toISOString();

writeFileSync('./static/av-infra.json', JSON.stringify({ created, projects }, null, 2));

console.log('✅ AV Infra metadata generated successfully.');
