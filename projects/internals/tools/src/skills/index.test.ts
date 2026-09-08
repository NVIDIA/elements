// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it } from 'vitest';
import { prompts, skills, type Prompt, type Skill } from './index.js';

describe('prompts', () => {
  it('should expose one prompt for each skill reference', () => {
    expect(prompts.map(prompt => prompt.name)).toEqual(['artifact', 'doctor', 'create-project', 'migrate']);
  });

  it('should have required properties for each prompt', () => {
    prompts.forEach((prompt: Prompt) => {
      expect(prompt.name.length).toBeGreaterThan(0);
      expect(prompt.title.length).toBeGreaterThan(0);
      expect(prompt.description.length).toBeGreaterThan(0);
      expect(typeof prompt.handler).toBe('function');
    });
  });

  it('should return valid message structures from handlers', () => {
    prompts.forEach((prompt: Prompt) => {
      const result = prompt.handler({});
      expect(result.messages).toHaveLength(1);
      expect(result.messages[0]?.role).toBe('user');
      expect(result.messages[0]?.content.type).toBe('text');
      expect(result.messages[0]?.content.text.endsWith('\n---')).toBe(true);
    });
  });

  it.each([
    ['artifact', 'references/artifact.md'],
    ['doctor', 'references/doctor.md'],
    ['create-project', 'references/integration.md'],
    ['migrate', 'references/migration.md']
  ])('should map the %s prompt to %s', (promptName, resourcePath) => {
    const skill = skills[0];
    const prompt = prompts.find(entry => entry.name === promptName);
    expect(prompt?.handler({}).messages[0]?.content.text).toBe(`${skill?.files[resourcePath]?.trimEnd()}\n---`);
  });
});

describe('skill entries', () => {
  it('should export the singular Elements skill', () => {
    expect(skills).toHaveLength(1);
    expect(skills[0]?.name).toBe('elements');
  });

  it('should have required metadata and files', () => {
    skills.forEach((skill: Skill) => {
      expect(skill.name.length).toBeGreaterThan(0);
      expect(skill.title.length).toBeGreaterThan(0);
      expect(skill.description.length).toBeGreaterThan(0);
      expect(Object.keys(skill.files)).toEqual([
        'SKILL.md',
        'references/artifact.md',
        'references/doctor.md',
        'references/integration.md',
        'references/migration.md'
      ]);
    });
  });

  it('should keep registry metadata aligned with SKILL.md frontmatter', () => {
    const skill = skills[0];
    const markdown = skill?.files['SKILL.md'];
    expect(markdown).toContain(`name: "${skill?.name}"`);
    expect(markdown).toContain(`description: "${skill?.description}"`);
    expect(markdown).toContain(`title: "${skill?.title}"`);
  });

  it('should retain progressive disclosure references', () => {
    const markdown = skills[0]?.files['SKILL.md'];
    expect(markdown).toContain('(./references/artifact.md)');
    expect(markdown).toContain('(./references/doctor.md)');
    expect(markdown).toContain('(./references/integration.md)');
    expect(markdown).toContain('(./references/migration.md)');
  });
});
