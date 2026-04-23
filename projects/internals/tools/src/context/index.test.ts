// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it } from 'vitest';
import { prompts, type Prompt } from './index.js';

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

    it('should have "search" prompt for API documentation', () => {
      const searchPrompt = prompts.find(p => p.name === 'search');
      expect(searchPrompt).toBeDefined();
      expect(searchPrompt?.description).toContain('API');

      const result = searchPrompt?.handler({});
      expect(result?.messages[0].content.text).toContain('api_');
    });

    it('should have "playground" prompt with authoring guidelines', () => {
      const playgroundPrompt = prompts.find(p => p.name === 'playground');
      expect(playgroundPrompt).toBeDefined();

      const result = playgroundPrompt?.handler({});
      expect(result?.messages[0].content.text).toContain('playground');
    });

    it('should have "create-project" prompt for starter projects', () => {
      const createProjectPrompt = prompts.find(p => p.name === 'create-project');
      expect(createProjectPrompt).toBeDefined();
      expect(createProjectPrompt?.description).toContain('Starter');

      const result = createProjectPrompt?.handler({});
      expect(result?.messages[0].content.text).toContain('project_create');
    });
  });
});
