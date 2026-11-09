// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { elementsSkill, prompts, skills } from './registry.js';

describe('skill registry', () => {
  it('bundles the current skill and every referenced document', () => {
    expect(skills).toEqual([elementsSkill]);
    for (const [path, content] of Object.entries(elementsSkill.files)) {
      const source = new URL(`../../../../../.agents/skills/elements/${path}`, import.meta.url);
      expect(content).toBe(readFileSync(source, 'utf8'));
    }
  });

  it.each([
    ['artifact', 'artifact.md'],
    ['doctor', 'doctor.md'],
    ['create-project', 'integration.md'],
    ['migrate', 'migration.md']
  ])('serves the complete %s prompt with its terminating separator', (name, filename) => {
    const prompt = prompts.find(entry => entry.name === name);
    const content = readFileSync(
      new URL(`../../../../../.agents/skills/elements/references/${filename}`, import.meta.url),
      'utf8'
    );
    expect(prompt?.handler({})).toEqual({
      messages: [
        {
          role: 'user',
          content: { type: 'text', text: `${content.trimEnd()}\n---` }
        }
      ]
    });
  });

  it('returns independent messages for each request', () => {
    const prompt = prompts[0];
    if (!prompt) throw new Error('Expected a registered prompt');
    const first = prompt.handler({});
    first.messages.length = 0;
    expect(prompt.handler({}).messages).toHaveLength(1);
  });
});
