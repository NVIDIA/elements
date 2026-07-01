// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { createHash } from 'node:crypto';
import { promises as fsp } from 'node:fs';
import { tmpdir } from 'node:os';
import nodePath from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { skills, type Skill } from './registry.js';
import {
  AGENT_SKILLS_DISCOVERY_SCHEMA,
  createAgentSkillArtifacts,
  validateSkillDescription,
  validateSkillName,
  writeAgentSkillArtifacts
} from './utils.js';

const temporaryDirectories: string[] = [];

function createSkill(name: string, overrides: Partial<Skill> = {}): Skill {
  return {
    name,
    title: `${name} title`,
    description: `${name} description`,
    context: `# ${name}\n\n${name} context`,
    ...overrides
  };
}

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

describe('validateSkillName', () => {
  it.each(['a', 'elements', 'skill-1', 'a'.repeat(64)])('should accept valid name %s', name => {
    expect(() => validateSkillName(name)).not.toThrow();
  });

  it.each([undefined, null, 1, '', 'Invalid', '-invalid', 'invalid-', 'invalid--name', 'invalid_name', 'a'.repeat(65)])(
    'should reject invalid name %s',
    name => {
      expect(() => validateSkillName(name)).toThrow(/Invalid Agent Skill name/);
    }
  );
});

describe('validateSkillDescription', () => {
  it.each(['a', 'a'.repeat(1024)])('should accept a description between 1 and 1,024 characters', description => {
    expect(() => validateSkillDescription('elements', description)).not.toThrow();
  });

  it.each([undefined, null, 1, '', ' ', 'a'.repeat(1025)])('should reject invalid description %s', description => {
    expect(() => validateSkillDescription('elements', description)).toThrow(
      /Invalid Agent Skill description for "elements"/
    );
  });
});

describe('createAgentSkillArtifacts', () => {
  it('should create deterministic discovery 0.2 entries', () => {
    const registry = [createSkill('zeta'), createSkill('alpha')];
    const artifacts = createAgentSkillArtifacts(registry);

    expect(artifacts.index.$schema).toBe(AGENT_SKILLS_DISCOVERY_SCHEMA);
    expect(artifacts.index.skills.map(skill => skill.name)).toEqual(['alpha', 'zeta']);
    expect(artifacts.index.skills.every(skill => skill.type === 'skill-md')).toBe(true);
    expect(artifacts.index.skills.map(skill => skill.url)).toEqual(['alpha/SKILL.md', 'zeta/SKILL.md']);
    expect(createAgentSkillArtifacts([...registry].reverse())).toEqual(artifacts);
  });

  it('should hash the exact generated Markdown bytes', () => {
    const artifacts = createAgentSkillArtifacts();

    expect(artifacts.index.skills.map(entry => entry.name)).toEqual(skills.map(skill => skill.name).sort());
    artifacts.index.skills.forEach(entry => {
      const markdown = artifacts.files.get(entry.url);
      expect(markdown).toBeDefined();
      if (!markdown) return;
      expect(entry.digest).toBe(`sha256:${createHash('sha256').update(Buffer.from(markdown, 'utf8')).digest('hex')}`);
    });
  });

  it('should generate standard frontmatter with the registry context', () => {
    const elements = skills.find(skill => skill.name === 'elements');
    expect(elements).toBeDefined();
    if (!elements) return;

    const artifacts = createAgentSkillArtifacts([elements]);
    const markdown = artifacts.files.get('elements/SKILL.md');

    expect(markdown).toMatch(
      /^---\nname: "elements"\ndescription: ".+"\nlicense: "Apache-2.0"\nmetadata:\n  title: "NVIDIA Elements Design System \(nve\)"\n---\n/
    );
    expect(markdown).not.toMatch(/^title:/m);
    expect(markdown).toContain(elements.context.trim());
    expect(markdown?.endsWith('\n')).toBe(true);
    expect(markdown?.endsWith('\n\n')).toBe(false);
  });

  it('should publish conditional skills supplied by the registry', () => {
    const artifacts = createAgentSkillArtifacts([createSkill('playground')]);

    expect(artifacts.index.skills.map(skill => skill.name)).toEqual(['playground']);
    expect(artifacts.files.has('playground/SKILL.md')).toBe(true);
  });

  it('should reject duplicate skill names', () => {
    expect(() => createAgentSkillArtifacts([createSkill('duplicate'), createSkill('duplicate')])).toThrow(
      'Duplicate Agent Skill name "duplicate".'
    );
  });
});

describe('writeAgentSkillArtifacts', () => {
  it('should write the index and skill directory tree', async () => {
    const publicOutputPath = await createTemporaryDirectory();
    await writeAgentSkillArtifacts(publicOutputPath, [createSkill('alpha'), createSkill('beta')]);
    const outputPath = nodePath.join(publicOutputPath, '.well-known', 'agent-skills');

    const index = JSON.parse(await fsp.readFile(nodePath.join(outputPath, 'index.json'), 'utf8'));
    expect(index.skills).toEqual([
      expect.objectContaining({ name: 'alpha' }),
      expect.objectContaining({ name: 'beta' })
    ]);
    await expect(fsp.readFile(nodePath.join(outputPath, 'alpha', 'SKILL.md'), 'utf8')).resolves.toContain(
      'name: "alpha"'
    );
    await expect(fsp.readFile(nodePath.join(outputPath, 'beta', 'SKILL.md'), 'utf8')).resolves.toContain(
      'name: "beta"'
    );
    expect((await fsp.readFile(nodePath.join(outputPath, 'index.json'), 'utf8')).endsWith('\n')).toBe(true);
  });

  it('should remove stale skills before writing', async () => {
    const publicOutputPath = await createTemporaryDirectory();
    const outputPath = nodePath.join(publicOutputPath, '.well-known', 'agent-skills');
    await writeAgentSkillArtifacts(publicOutputPath, [createSkill('current'), createSkill('stale')]);
    await writeAgentSkillArtifacts(publicOutputPath, [createSkill('current')]);

    await expect(fsp.stat(nodePath.join(outputPath, 'stale'))).rejects.toMatchObject({ code: 'ENOENT' });
    await expect(fsp.readFile(nodePath.join(outputPath, 'current', 'SKILL.md'), 'utf8')).resolves.toBeDefined();
  });
});
