import { writeFileSync } from 'node:fs';
import { generateLighthouseReport } from './lighthouse.utils.ts';

const report = await generateLighthouseReport();

writeFileSync('./static/lighthouse.json', JSON.stringify(report, null, 2));

console.log('✅ Lighthouse metadata generated successfully.');
