// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it } from 'vitest';
import { formatSkillMarkdown, prompts, skills, type Prompt, type Skill } from './index.js';

describe('prompts', () => {
  it('should export an array of prompts', () => {
    expect(Array.isArray(prompts)).toBe(true);
    expect(prompts.length).toBeGreaterThan(0);
  });

  it('should have required properties for each prompt', () => {
    prompts.forEach((prompt: Prompt) => {
      expect(prompt.name).toBeDefined();
      expect(typeof prompt.name).toBe('string');
      expect(prompt.name.length).toBeGreaterThan(0);

      expect(prompt.title).toBeDefined();
      expect(typeof prompt.title).toBe('string');
      expect(prompt.title.length).toBeGreaterThan(0);

      expect(prompt.description).toBeDefined();
      expect(typeof prompt.description).toBe('string');
      expect(prompt.description.length).toBeGreaterThan(0);

      expect(prompt.handler).toBeDefined();
      expect(typeof prompt.handler).toBe('function');
    });
  });

  it('should have unique prompt names', () => {
    const names = prompts.map(p => p.name);
    const uniqueNames = new Set(names);
    expect(uniqueNames.size).toBe(names.length);
  });

  it('should return valid message structure from handlers', () => {
    prompts.forEach((prompt: Prompt) => {
      const result = prompt.handler({});

      expect(result).toBeDefined();
      expect(result.messages).toBeDefined();
      expect(Array.isArray(result.messages)).toBe(true);
      expect(result.messages.length).toBeGreaterThan(0);

      result.messages.forEach(message => {
        expect(message.role).toBeDefined();
        expect(['user', 'assistant']).toContain(message.role);
        expect(message.content).toBeDefined();
        expect(message.content.type).toBe('text');
        expect(typeof message.content.text).toBe('string');
        expect(message.content.text.length).toBeGreaterThan(0);
      });
    });
  });

  describe('individual prompts', () => {
    it('should have "about" prompt with introduction content', () => {
      const aboutPrompt = prompts.find(p => p.name === 'about');
      expect(aboutPrompt).toBeDefined();
      expect(aboutPrompt?.title).toContain('Elements');

      const result = aboutPrompt?.handler({});
      expect(result?.messages[0].content.text).toContain('Elements Design System');
    });

    it('should have "doctor" prompt for setup checking', () => {
      const doctorPrompt = prompts.find(p => p.name === 'doctor');
      expect(doctorPrompt).toBeDefined();
      expect(doctorPrompt?.description).toContain('setup');

      const result = doctorPrompt?.handler({});
      expect(result?.messages[0].content.text).toContain('MCP');
    });

    it('should have "artifact" prompt with the standalone HTML template', () => {
      const artifactPrompt = prompts.find(p => p.name === 'artifact');
      expect(artifactPrompt).toBeDefined();
      expect(artifactPrompt?.title).toBe('NVIDIA Artifact Template');

      const result = artifactPrompt?.handler({});
      expect(result?.messages[0].content.text).toContain('<title>NVIDIA Elements Artifact</title>');
      expect(result?.messages[0].content.text).toContain('@nvidia-elements/core/dist/bundles/index.min.js');
    });

    it('should have "search" prompt for API documentation', () => {
      const searchPrompt = prompts.find(p => p.name === 'search');
      expect(searchPrompt).toBeDefined();
      expect(searchPrompt?.description).toContain('API');

      const result = searchPrompt?.handler({});
      expect(result?.messages[0].content.text).toContain('nve api.');
    });

    it.skipIf(!prompts.some(p => p.name === 'playground'))(
      'should have "playground" prompt with authoring guidelines',
      () => {
        const playgroundPrompt = prompts.find(p => p.name === 'playground');
        expect(playgroundPrompt).toBeDefined();

        const result = playgroundPrompt?.handler({});
        expect(result?.messages[0].content.text).toContain('playground');
      }
    );

    it('should have "create-project" prompt for starter projects', () => {
      const createProjectPrompt = prompts.find(p => p.name === 'create-project');
      expect(createProjectPrompt).toBeDefined();
      expect(createProjectPrompt?.description).toContain('Starter');

      const result = createProjectPrompt?.handler({});
      expect(result?.messages[0].content.text).toContain('nve project.create');
    });
  });
});

describe('skillEntries', () => {
  it('should export an array of skill entries', () => {
    expect(Array.isArray(skills)).toBe(true);
    expect(skills.length).toBeGreaterThan(0);
  });

  it('should have required properties for each skill entry', () => {
    skills.forEach((skill: Skill) => {
      expect(skill.name).toBeDefined();
      expect(typeof skill.name).toBe('string');
      expect(skill.name.length).toBeGreaterThan(0);

      expect(skill.title).toBeDefined();
      expect(typeof skill.title).toBe('string');
      expect(skill.title.length).toBeGreaterThan(0);

      expect(skill.description).toBeDefined();
      expect(typeof skill.description).toBe('string');
      expect(skill.description.length).toBeGreaterThan(0);

      expect(skill.context).toBeDefined();
      expect(typeof skill.context).toBe('string');
      expect(skill.context.length).toBeGreaterThan(0);
    });
  });

  it('should have unique skill entry names', () => {
    const names = skills.map(skill => skill.name);
    const uniqueNames = new Set(names);
    expect(uniqueNames.size).toBe(names.length);
  });

  it('should include authoring, artifact, and elements entries', () => {
    expect(skills.some(skill => skill.name === 'authoring')).toBe(true);
    expect(skills.some(skill => skill.name === 'artifact')).toBe(true);
    expect(skills.some(skill => skill.name === 'elements')).toBe(true);
  });

  it('should default elements skill guidance to UI and artifact work', () => {
    const elementsSkill = skills.find(skill => skill.name === 'elements');
    expect(elementsSkill?.description).toContain('any UI-related work');
    expect(elementsSkill?.description).toContain('standalone UI artifacts');
    expect(elementsSkill?.context).toContain('prefer the canonical absolute executable path');
    expect(elementsSkill?.context).toContain('$HOME/.nve/bin/nve');
    expect(elementsSkill?.context).toContain('## Creating an Artifact');
    expect(elementsSkill?.context).toContain('@nvidia-elements/core/dist/bundles/index.min.js');
  });

  it('should format skills as installable markdown files', () => {
    const elementsSkill = skills.find(skill => skill.name === 'elements');
    expect(elementsSkill).toBeDefined();
    if (!elementsSkill) return;

    const markdown = formatSkillMarkdown(elementsSkill);

    expect(markdown).toMatch(/^---\nname: "elements"\ntitle: "Elements Design System \(nve\)"/);
    expect(markdown).toContain('description: "Use this skill by default');
    expect(markdown).toContain('# Building UI with NVIDIA Elements');
    expect(markdown.endsWith('\n')).toBe(true);
  });
});
