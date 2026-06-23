import { readdir, readFile } from 'node:fs/promises';
import { relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const AUTHORED_SITE_SEGMENTS = '(?:docs|examples|starters|static)';
const RELATIVE_INTERNAL_LINK_PATTERN = new RegExp(`(?:href=["']|src=["']|]\\()(?:\\.\\/)?${AUTHORED_SITE_SEGMENTS}\\/`);
const BASE_PREFIXED_INTERNAL_LINK_PATTERN = new RegExp(
  `(?:href=["']|src=["']|]\\()\\/elements\\/${AUTHORED_SITE_SEGMENTS}\\/`
);
const JS_RELATIVE_INTERNAL_LINK_PATTERN = new RegExp(`\\b(?:href|src):\\s*['"](?:\\.\\/)?${AUTHORED_SITE_SEGMENTS}\\/`);
const JS_BASE_PREFIXED_INTERNAL_LINK_PATTERN = new RegExp(
  `\\b(?:href|src):\\s*['"]\\/elements\\/${AUTHORED_SITE_SEGMENTS}\\/`
);

async function getAuthoredFiles(dir: URL): Promise<URL[]> {
  const entries = await readdir(dir, { withFileTypes: true });
  const nestedFiles = await Promise.all(
    entries.map(entry => {
      const path = new URL(`${entry.name}${entry.isDirectory() ? '/' : ''}`, dir);
      if (entry.isDirectory()) return getAuthoredFiles(path);
      return /\.(?:11ty\.)?(?:js|md|ts)$/.test(entry.name) && !entry.name.includes('.test.') ? [path] : [];
    })
  );

  return nestedFiles.flat();
}

describe('docs links', () => {
  it('should use root-relative paths for authored site links', async () => {
    const files = await getAuthoredFiles(new URL('../../', import.meta.url));
    const relativeLinks = (
      await Promise.all(
        files.map(async file => {
          const content = await readFile(file, 'utf8');
          const hasInvalidLink =
            RELATIVE_INTERNAL_LINK_PATTERN.test(content) ||
            BASE_PREFIXED_INTERNAL_LINK_PATTERN.test(content) ||
            JS_RELATIVE_INTERNAL_LINK_PATTERN.test(content) ||
            JS_BASE_PREFIXED_INTERNAL_LINK_PATTERN.test(content);

          if (!hasInvalidLink) return null;

          return relative(process.cwd(), fileURLToPath(file));
        })
      )
    ).filter(value => value !== null);

    expect(relativeLinks).toEqual([]);
  });
});
