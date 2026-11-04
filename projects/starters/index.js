import { existsSync, readdirSync } from 'fs';
import { join } from 'path';
import { archiveStarter } from '@internals/tools/project';
import { cwd } from 'process';

/**
 * Export starters
 * - clean up package.json files to be externalized from pnpm workspace
 * - inline wireit scripts
 * - zip compress for easy download
 */
const root = cwd();
const dirs = readdirSync(root, { withFileTypes: true });
for (const dir of dirs) {
  if (
    dir.isDirectory() &&
    dir.name !== 'dist' &&
    dir.name !== 'node_modules' &&
    dir.name !== '.wireit' &&
    existsSync(join(root, dir.name, 'package.json'))
  ) {
    await archiveStarter(dir.name, 'dist');
  }
}
