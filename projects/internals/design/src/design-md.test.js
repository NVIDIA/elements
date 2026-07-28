import { promises as fsp } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { createDesignMdContent } from './design-md.js';

const repositoryDesignMdPath = fileURLToPath(new URL('../../../../DESIGN.md', import.meta.url));
const builtDesignMdPath = fileURLToPath(new URL('../dist/DESIGN.md', import.meta.url));

describe('DESIGN.md generation', () => {
  it('should generate the Google DESIGN.md structure from resolved Elements tokens', () => {
    const content = createDesignMdContent();

    expect(content.startsWith('---\nversion: "alpha"\nname: "NVIDIA Elements"')).toBe(true);
    expect(content).toContain('nve-sys-accent-primary-background: "oklch(');
    expect(content).toContain('nve-sys-layer-container-background: "oklch(');
    expect(content).toContain('nve-sys-interaction-selected-background: "oklch(');
    expect(content).toContain('nve-sys-support-danger-emphasis-color: "oklch(');
    expect(content).toContain('nve-sys-visualization-categorical-violet: "oklch(');
    expect(content.match(/^ {2}nve-sys-/gm)).toHaveLength(126);
    expect(content).toContain("fontFamily: \"'Inter'");
    expect(content).not.toMatch(/^ {2}(?:primary|canvas|surface|text|danger|success|warning):/m);
    expect(content).not.toMatch(/:\s+"nve-(?:ref|sys)-/);
  });

  it('should emit specification sections in the required order', () => {
    const content = createDesignMdContent();
    const headings = [
      '## Overview',
      '## Colors',
      '## Typography',
      '## Layout',
      '## Elevation & Depth',
      '## Shapes',
      '## Components',
      "## Do and Don't"
    ];

    expect(headings.map(heading => content.indexOf(heading)).every(index => index > 0)).toBe(true);
    expect([...headings].sort((left, right) => content.indexOf(left) - content.indexOf(right))).toEqual(headings);
  });

  it('should keep the repository artifact synchronized with the generator', async () => {
    await expect(fsp.readFile(repositoryDesignMdPath, 'utf8')).resolves.toBe(createDesignMdContent());
  });

  it('should keep the built artifact synchronized with the generator', async () => {
    await expect(fsp.readFile(builtDesignMdPath, 'utf8')).resolves.toBe(createDesignMdContent());
  });
});
