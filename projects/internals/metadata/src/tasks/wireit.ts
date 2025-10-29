#!/usr/bin/env node

import { writeFileSync } from 'fs';
import { resolve } from 'path';
import { generateGraphData } from './wireit.utils.ts';

writeFileSync(resolve(import.meta.dirname, '../../static/wireit.json'), JSON.stringify(generateGraphData(), null, 2));
console.log(`✅ Wireit graph data generated successfully.`);
