// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it } from 'vitest';
import type { ToolMethod } from '../internal/tools.js';
import { SkillsService, type SkillListItem } from './service.js';
import { type Skill } from './registry.js';

describe('SkillsService', () => {
  it('should provide list tool metadata', async () => {
    const result = await SkillsService.list();
    expect(result).toContain('`authoring`');
    expect((SkillsService.list as ToolMethod<unknown>).metadata.name).toBe('list');
    expect((SkillsService.list as ToolMethod<unknown>).metadata.command).toBe('list');
    expect((SkillsService.list as ToolMethod<unknown>).metadata.summary).toBe(
      'Get a list of available Elements agent skills and context.'
    );
  });

  it('should list skills as json', async () => {
    const result = (await SkillsService.list({ format: 'json' })) as SkillListItem[];
    expect(result.some(entry => entry.name === 'authoring')).toBe(true);
    expect(result.some(entry => entry.name === 'elements')).toBe(true);
    expect(result.every(entry => Object.keys(entry).sort().join(',') === 'description,name,title')).toBe(true);
  });

  it('should get a skill context as markdown by default', async () => {
    const result = await SkillsService.get({ name: 'authoring' });
    expect(result).toContain(
      `---
name: "authoring"
title: "NVIDIA Elements Authoring Guidelines"
description: "Best practices and workflow guidance for authoring UI with NVIDIA Elements."
---`
    );
    expect(result).toMatch(/^---\nname: "authoring"/);
    expect(result).toContain('## Authoring Guidelines');
    expect((SkillsService.get as ToolMethod<unknown>).metadata.name).toBe('get');
    expect((SkillsService.get as ToolMethod<unknown>).metadata.command).toBe('get');
    expect((SkillsService.get as ToolMethod<unknown>).metadata.inputSchema?.required).toContain('name');
  });

  it('should get a skill context as json', async () => {
    const result = (await SkillsService.get({ name: 'elements', format: 'json' })) as Skill;
    expect(result.name).toBe('elements');
    expect(result.context).toContain('Building UI with NVIDIA Elements');
  });

  it('should get the artifact skill context', async () => {
    const result = await SkillsService.get({ name: 'artifact' });
    expect(result).toContain('name: "artifact"');
    expect(result).toContain('<title>NVIDIA Elements Artifact</title>');
    expect(result).toContain('@nvidia-elements/core/dist/bundles/index.min.js');
  });

  it('should match skill names case-insensitively', async () => {
    const result = (await SkillsService.get({ name: 'AUTHORING', format: 'json' })) as Skill;
    expect(result.name).toBe('authoring');
  });

  it('should reject unknown skill names with the available list', async () => {
    await expect(SkillsService.get({ name: 'unknown-skill' })).rejects.toThrow(
      /Unknown skill "unknown-skill"[\s\S]*Available skills:/
    );
  });
});
