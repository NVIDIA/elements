import { promises as fsp } from 'node:fs';
import { tmpdir } from 'node:os';
import nodePath from 'node:path';
import { AGENT_SKILLS_DISCOVERY_SCHEMA } from '@internals/tools/skills';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { agentSkillsPlugin } from './agent-skills.js';

const temporaryDirectories: string[] = [];

async function createTemporaryDirectory() {
  const directory = await fsp.mkdtemp(nodePath.join(tmpdir(), 'elements-agent-skills-'));
  temporaryDirectories.push(directory);
  return directory;
}

afterEach(async () => {
  await Promise.all(
    temporaryDirectories.splice(0).map(directory => fsp.rm(directory, { recursive: true, force: true }))
  );
});

describe('agentSkillsPlugin', () => {
  it('should register an Eleventy before handler', () => {
    const on = vi.fn();

    agentSkillsPlugin({ on });

    expect(on).toHaveBeenCalledWith('eleventy.before', expect.any(Function));
  });

  it('should write under the Eleventy public output directory', async () => {
    const root = await createTemporaryDirectory();
    const output = nodePath.join(root, 'dist');
    const on = vi.fn();
    agentSkillsPlugin({ on });
    const callback = on.mock.calls[0][1];

    await callback({ directories: { output } });

    const outputPath = nodePath.join(output, 'public', '.well-known', 'agent-skills');
    const index = JSON.parse(await fsp.readFile(nodePath.join(outputPath, 'index.json'), 'utf8'));
    expect(index).toEqual({
      $schema: AGENT_SKILLS_DISCOVERY_SCHEMA,
      skills: [expect.objectContaining({ name: 'elements' })]
    });
    await expect(fsp.stat(nodePath.join(outputPath, 'about'))).rejects.toMatchObject({ code: 'ENOENT' });
  });
});

describe('production site build', () => {
  it('should preserve only the elements skill in dist', async () => {
    const outputPath = 'dist/.well-known/agent-skills';
    const index = JSON.parse(await fsp.readFile(nodePath.join(outputPath, 'index.json'), 'utf8'));

    expect(index.skills).toEqual([expect.objectContaining({ name: 'elements' })]);
    await expect(fsp.readFile(nodePath.join(outputPath, 'elements', 'SKILL.md'), 'utf8')).resolves.toContain(
      'name: "elements"'
    );
    await expect(fsp.stat(nodePath.join(outputPath, 'about'))).rejects.toMatchObject({ code: 'ENOENT' });
  });
});
