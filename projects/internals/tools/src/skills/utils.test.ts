// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { createHash } from 'node:crypto';
import { promises as fsp } from 'node:fs';
import { tmpdir } from 'node:os';
import nodePath from 'node:path';
import { strFromU8, unzipSync } from 'fflate';
import { afterEach, describe, expect, it } from 'vitest';
import { skills, type Skill } from './registry.js';
import {
  AGENT_SKILLS_DISCOVERY_SCHEMA,
  createAgentSkillArtifacts,
  validateSkillDescription,
  validateSkillEntries,
  validateSkillName,
  writeAgentSkillArtifacts,
  writeSkillDirectory,
  writeSkillDirectorySync
} from './utils.js';

const temporaryDirectories: string[] = [];

function createSkill(name: string, overrides: Partial<Skill> = {}): Skill {
  const title = `${name} title`;
  const description = `${name} description`;
  return {
    name,
    title,
    description,
    files: {
      'SKILL.md': `---\nname: ${JSON.stringify(name)}\ndescription: ${JSON.stringify(description)}\nmetadata:\n  title: ${JSON.stringify(title)}\n---\n\n# ${name}\n`
    },
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

describe('validateSkillEntries', () => {
  it('should reject duplicate skill names', () => {
    expect(() => validateSkillEntries([createSkill('duplicate'), createSkill('duplicate')])).toThrow(
      'Duplicate Agent Skill name "duplicate".'
    );
  });

  it.each(['../outside.md', '/absolute.md', 'references\\windows.md', './SKILL.md'])(
    'should reject unsafe file path %s',
    filePath => {
      const skill = createSkill('unsafe', {
        files: { 'SKILL.md': createSkill('unsafe').files['SKILL.md']!, [filePath]: 'x' }
      });
      expect(() => validateSkillEntries([skill])).toThrow(/Invalid file path/);
    }
  );

  it('should require SKILL.md', () => {
    expect(() => validateSkillEntries([createSkill('missing', { files: { 'references/a.md': 'x' } })])).toThrow(
      'must include SKILL.md'
    );
  });
});

describe('createAgentSkillArtifacts', () => {
  it('should create deterministic single-file discovery entries', () => {
    const registry = [createSkill('zeta'), createSkill('alpha')];
    const artifacts = createAgentSkillArtifacts(registry);

    expect(artifacts.index.$schema).toBe(AGENT_SKILLS_DISCOVERY_SCHEMA);
    expect(artifacts.index.skills.map(skill => skill.name)).toEqual(['alpha', 'zeta']);
    expect(artifacts.index.skills.every(skill => skill.type === 'skill-md')).toBe(true);
    expect(artifacts.index.skills.map(skill => skill.url)).toEqual(['alpha/SKILL.md', 'zeta/SKILL.md']);
    expect(createAgentSkillArtifacts([...registry].reverse())).toEqual(artifacts);
  });

  it('should archive a multi-file skill with a deterministic digest', () => {
    const skill = createSkill('bundled', {
      files: {
        ...createSkill('bundled').files,
        'references/guide.md': '# Guide\n'
      }
    });
    const first = createAgentSkillArtifacts([skill]);
    const second = createAgentSkillArtifacts([skill]);
    const entry = first.index.skills[0]!;
    const archive = first.files.get(entry.url);

    expect(entry).toMatchObject({ name: 'bundled', type: 'archive', url: 'bundled.zip' });
    expect(archive).toBeInstanceOf(Uint8Array);
    expect(second).toEqual(first);
    if (!(archive instanceof Uint8Array)) return;
    const files = unzipSync(archive);
    expect(strFromU8(files['SKILL.md']!)).toBe(skill.files['SKILL.md']);
    expect(strFromU8(files['references/guide.md']!)).toBe('# Guide\n');
    expect(entry.digest).toBe(`sha256:${createHash('sha256').update(archive).digest('hex')}`);
  });

  it('should archive the complete Elements skill', () => {
    const artifacts = createAgentSkillArtifacts(skills);
    const entry = artifacts.index.skills[0]!;
    const archive = artifacts.files.get(entry.url);
    expect(entry.type).toBe('archive');
    if (!(archive instanceof Uint8Array)) throw new TypeError('Expected an archive');
    expect(Object.keys(unzipSync(archive)).sort()).toEqual(Object.keys(skills[0]!.files).sort());
  });
});

describe('writeSkillDirectory', () => {
  it('should update every bundled file and preserve user files', async () => {
    const root = await createTemporaryDirectory();
    const skill = createSkill('elements', {
      files: { ...createSkill('elements').files, 'references/guide.md': '# Guide\n' }
    });
    const skillDirectory = nodePath.join(root, 'elements');
    await fsp.mkdir(skillDirectory);
    await fsp.writeFile(nodePath.join(skillDirectory, 'SKILL.md'), 'old skill');
    await fsp.writeFile(nodePath.join(skillDirectory, 'user.md'), 'user content');

    const paths = await writeSkillDirectory(skillDirectory, skill);

    expect(paths).toHaveLength(2);
    await expect(fsp.readFile(nodePath.join(skillDirectory, 'SKILL.md'), 'utf8')).resolves.toBe(
      skill.files['SKILL.md']
    );
    await expect(fsp.readFile(nodePath.join(skillDirectory, 'references', 'guide.md'), 'utf8')).resolves.toBe(
      '# Guide\n'
    );
    await expect(fsp.readFile(nodePath.join(skillDirectory, 'user.md'), 'utf8')).resolves.toBe('user content');
  });

  it('should preserve user files when updating synchronously', async () => {
    const root = await createTemporaryDirectory();
    const skill = createSkill('elements');
    const skillDirectory = nodePath.join(root, 'elements');
    await fsp.mkdir(skillDirectory);
    await fsp.writeFile(nodePath.join(skillDirectory, 'SKILL.md'), 'old skill');
    await fsp.writeFile(nodePath.join(skillDirectory, 'user.md'), 'user content');

    const paths = writeSkillDirectorySync(skillDirectory, skill);

    expect(paths).toHaveLength(1);
    await expect(fsp.readFile(nodePath.join(skillDirectory, 'SKILL.md'), 'utf8')).resolves.toBe(
      skill.files['SKILL.md']
    );
    await expect(fsp.readFile(nodePath.join(skillDirectory, 'user.md'), 'utf8')).resolves.toBe('user content');
  });
});

describe('writeAgentSkillArtifacts', () => {
  it('should write the index and archive', async () => {
    const publicOutputPath = await createTemporaryDirectory();
    await writeAgentSkillArtifacts(publicOutputPath, skills);
    const outputPath = nodePath.join(publicOutputPath, '.well-known', 'agent-skills');
    const index = JSON.parse(await fsp.readFile(nodePath.join(outputPath, 'index.json'), 'utf8'));

    expect(index.skills).toEqual([expect.objectContaining({ name: 'elements', type: 'archive' })]);
    const archive = await fsp.readFile(nodePath.join(outputPath, 'elements.zip'));
    expect(Object.keys(unzipSync(archive)).sort()).toEqual(Object.keys(skills[0]!.files).sort());
    expect((await fsp.readFile(nodePath.join(outputPath, 'index.json'), 'utf8')).endsWith('\n')).toBe(true);
  });

  it('should remove stale skills before writing', async () => {
    const publicOutputPath = await createTemporaryDirectory();
    const outputPath = nodePath.join(publicOutputPath, '.well-known', 'agent-skills');
    await writeAgentSkillArtifacts(publicOutputPath, [createSkill('stale')]);
    await writeAgentSkillArtifacts(publicOutputPath, [createSkill('current')]);

    await expect(fsp.stat(nodePath.join(outputPath, 'stale'))).rejects.toMatchObject({ code: 'ENOENT' });
    await expect(fsp.readFile(nodePath.join(outputPath, 'current', 'SKILL.md'), 'utf8')).resolves.toBeDefined();
  });
});
