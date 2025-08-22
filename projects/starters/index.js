import { readdirSync } from 'fs';
import { archiveStarter } from '@nve-internals/tools/project';
import { cwd } from 'process';

/**
 * Export starters
 * - clean up package.json files to be externalized from pnpm workspace
 * - inline wireit scripts
 * - zip compress for easy download
 */
const dirs = readdirSync(cwd(), { withFileTypes: true });
for (const dir of dirs) {
  if (dir.isDirectory() && dir.name !== 'dist' && dir.name !== 'node_modules' && dir.name !== '.wireit') {
    await archiveStarter(dir.name, 'dist');
  }
}
