import nodePath from 'node:path';

export function getPublicOutputPath(directories = {}) {
  return nodePath.join(directories.output ?? 'dist', 'public');
}
