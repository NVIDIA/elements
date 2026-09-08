// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type { Schema } from '../internal/tools.js';
import skillMarkdown from '../../../../../.agents/skills/elements/SKILL.md?inline';
import artifactContext from '../../../../../.agents/skills/elements/references/artifact.md?inline';
import doctorContext from '../../../../../.agents/skills/elements/references/doctor.md?inline';
import integrationContext from '../../../../../.agents/skills/elements/references/integration.md?inline';
import migrationContext from '../../../../../.agents/skills/elements/references/migration.md?inline';

export interface Skill {
  name: string;
  title: string;
  description: string;
  files: Readonly<Record<string, string>>;
}

/**
 * https://github.com/modelcontextprotocol/typescript-sdk?tab=readme-ov-file#prompts
 */
export interface Prompt {
  name: string;
  title: string;
  description: string;
  argsSchema?: Schema;
  handler: (args: Record<string, unknown>) => {
    messages: {
      role: 'user' | 'assistant';
      content: {
        type: 'text';
        text: string;
      };
    }[];
  };
}

interface PromptDefinition extends Pick<Prompt, 'name' | 'title' | 'description'> {
  context: string;
}

function createPrompt({ name, title, description, context }: PromptDefinition): Prompt {
  return {
    name,
    title,
    description,
    handler: () => ({
      messages: [
        {
          role: 'user',
          content: {
            type: 'text',
            text: `${context.trimEnd()}\n---`
          }
        }
      ]
    })
  };
}

export const prompts: Prompt[] = [
  createPrompt({
    name: 'artifact',
    title: 'NVIDIA Artifact Template',
    description: 'Instructions for creating standalone UI artifacts with the NVIDIA Elements CDN template',
    context: artifactContext
  }),
  createPrompt({
    name: 'doctor',
    title: 'Elements Design System Doctor / Setup Check',
    description: 'Instructions for ensuring the Elements Design System is setup correctly',
    context: doctorContext
  }),
  createPrompt({
    name: 'create-project',
    title: 'Initialize a new Elements Starter Project',
    description: 'Best practices for initializing an Elements Starter Project',
    context: integrationContext
  }),
  createPrompt({
    name: 'migrate',
    title: 'Migrate from Deprecated Elements APIs',
    description:
      'Instructions for migrating a project from deprecated Elements APIs using lint tooling and CLI health checks',
    context: migrationContext
  })
];

export const elementsSkill: Skill = {
  name: 'elements',
  title: 'NVIDIA Elements Design System (nve)',
  description:
    'Use this skill by default for any UI-related work or with NVIDIA Elements (nve-*), including creating, editing, reviewing, or debugging HTML, CSS, layout, theming, components, applications, prototypes, Claude Artifacts, Codex Sites pages, and standalone UI artifacts.',
  files: {
    'SKILL.md': skillMarkdown,
    'references/artifact.md': artifactContext,
    'references/doctor.md': doctorContext,
    'references/integration.md': integrationContext,
    'references/migration.md': migrationContext
  }
};

export const skills: Skill[] = [elementsSkill];
