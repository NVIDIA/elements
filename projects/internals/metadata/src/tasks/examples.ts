import { writeFileSync } from 'node:fs';
import { getExamples } from './examples.utils.ts';

const examples = await getExamples();

writeFileSync('./static/examples.json', JSON.stringify(examples, null, 2));
console.log('✅ Examples generated successfully.');
