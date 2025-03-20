import { writeFileSync } from 'node:fs';
import { getMetadata } from './metadata.utils.ts';

const metadata = await getMetadata();

writeFileSync('./static/index.json', JSON.stringify(metadata, null, 2));
console.log('✅ Metadata generated successfully.');
