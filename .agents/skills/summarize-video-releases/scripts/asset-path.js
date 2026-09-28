import { realpathSync } from 'node:fs';
import { isAbsolute, relative, resolve, sep } from 'node:path';

// Decode once, then keep every request inside its assigned document root.
export function resolveAssetPath(root, encodedPath) {
  let path;
  try {
    path = decodeURIComponent(encodedPath);
  } catch {
    return null;
  }
  if (path.includes('\0')) return null;
  try {
    const absoluteRoot = realpathSync(root);
    const file = realpathSync(resolve(absoluteRoot, path));
    const inside = relative(absoluteRoot, file);
    return inside === '..' || inside.startsWith(`..${sep}`) || isAbsolute(inside) ? null : file;
  } catch {
    return null;
  }
}
