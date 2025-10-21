import { writeFileSync } from 'node:fs';
import { generateTestSummary } from './tests.utils.ts';

const summary = await generateTestSummary();

writeFileSync('./static/tests.json', JSON.stringify(summary, null, 2));
console.log('✅ Test summary generated successfully.');
