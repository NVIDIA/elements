import { writeFileSync } from 'node:fs';
import { getApi } from './api.utils.ts';

const api = await getApi();

writeFileSync('./static/api.json', JSON.stringify(api, null, 2));
console.log('✅ API generated successfully.');
