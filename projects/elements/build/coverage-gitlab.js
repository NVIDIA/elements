import { readFileSync } from 'fs';
import path from 'path';
import * as url from 'url';

const __dirname = url.fileURLToPath(new URL('.', import.meta.url));
const resolve = (rel) => path.resolve(__dirname, rel);

const coverage = readFileSync(resolve('../coverage/unit/coverage-summary.json'));

console.log(`Elements Coverage: ${JSON.parse(coverage).total.branches.pct}%`);