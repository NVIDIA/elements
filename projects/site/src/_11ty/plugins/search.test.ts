import { access, mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { searchPlugin } from './search.js';

describe('searchPlugin', () => {
  let outputPath: string | undefined;

  afterEach(async () => {
    if (outputPath) await rm(outputPath, { force: true, recursive: true });
  });

  it('should publish the search index to the selected site output', async () => {
    outputPath = await mkdtemp(join(tmpdir(), 'elements-search-'));
    const on = vi.fn();
    const addTransform = vi.fn();
    await searchPlugin({ on, addTransform });
    const transform = addTransform.mock.calls[0]?.[1];
    const afterBuild = on.mock.calls.find(([event]) => event === 'eleventy.after')?.[1];

    await transform.call(
      { page: { url: '/docs/elements/tabs/', inputPath: 'tabs.html' } },
      '<html lang="en"><body><h1>Tabs</h1><p>Tab composition</p></body></html>'
    );
    await afterBuild({ directories: { output: outputPath } });

    await expect(access(join(outputPath, '.pagefind', 'pagefind.js'))).resolves.toBeUndefined();
  });
});
