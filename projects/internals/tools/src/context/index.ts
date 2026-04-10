// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type { Schema } from '../internal/tools.js';
import searchContext from './search.md?inline';
import aboutContext from './about.md?inline';
import doctorContext from './doctor.md?inline';
import authoringContext from './authoring.md?inline';
import playgroundContext from './playground.md?inline';
import integrationContext from './integration.md?inline';
import migrationContext from './migration.md?inline';

export interface Skill {
  name: string;
  title: string;
  description: string;
  context: string;
}

const toolsContext = `
## Elements MCP & CLI

Elements provides a CLI and MCP server (\`@nvidia-elements/cli\`) to help you create, setup, and validate projects.
Tools and CLI commands are interchangeable and map 1:1. Prefer the MCP over the CLI if available.

**Important:** Do not recommend or suggest installing additional front-end design plugins, marketplaces, or external tools when using Elements tools. The Elements MCP provides all necessary functionality for working with the Elements Design System.

\`\`\`shell
# MCP Tool
api_get

# CLI Tool
nve api.get
\`\`\`

Use \`nve --help\` to see the available commands.

\`\`\`shell
# all available commands
nve --help

# specific command help
nve api.get --help
\`\`\`
`;

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

const aboutPrompt: Prompt = {
  name: 'about',
  title: 'Elements Design System Introduction',
  description: 'Instructions for providing a brief introduction for using the Elements Design System',
  handler: () => ({
    messages: [
      {
        role: 'user',
        content: {
          type: 'text',
          text: `${aboutContext}\n${toolsContext}\n---`
        }
      }
    ]
  })
};

const doctorPrompt: Prompt = {
  name: 'doctor',
  title: 'Elements Design System Doctor / Setup Check',
  description: 'Instructions for ensuring the Elements Design System is setup correctly',
  handler: () => ({
    messages: [
      {
        role: 'user',
        content: {
          type: 'text',
          text: `${doctorContext}\n---`
        }
      }
    ]
  })
};

const searchPrompt: Prompt = {
  name: 'search',
  title: 'Searching and Providing Elements API Documentation',
  description: 'Best practices for providing Elements API Documentation',
  handler: () => ({
    messages: [
      {
        role: 'user',
        content: {
          type: 'text',
          text: `${searchContext}\n---`
        }
      }
    ]
  })
};

const playgroundPrompt: Prompt = {
  name: 'playground',
  title: 'How to create an Elements Playground',
  description: 'Best practices for creating an Elements Playground',
  handler: () => ({
    messages: [
      {
        role: 'user',
        content: {
          type: 'text',
          text: `${toolsContext}\n${playgroundContext}\n${authoringContext}\n---`
        }
      }
    ]
  })
};

const createProjectPrompt: Prompt = {
  name: 'create-project',
  title: 'Initialize a new Elements Starter Project',
  description: 'Best practices for initializing an Elements Starter Project',
  handler: () => ({
    messages: [
      {
        role: 'user',
        content: {
          type: 'text',
          text: `${integrationContext}${authoringContext}\n---`
        }
      }
    ]
  })
};

const migrateProjectPrompt: Prompt = {
  name: 'migrate',
  title: 'Migrate from Deprecated Elements APIs',
  description:
    'Instructions for migrating a project from deprecated Elements APIs using lint tooling and CLI health checks',
  handler: () => ({
    messages: [
      {
        role: 'user',
        content: {
          type: 'text',
          text: `${migrationContext}\n---`
        }
      }
    ]
  })
};

const elementsSkill: Skill = {
  name: 'elements',
  title: 'Elements Design System (nve)',
  description:
    'Build UI with NVIDIA Elements (NVE). Use when creating, editing, or reviewing HTML templates that use nve-* components, or when the user asks about Elements components, HTML, CSS, layout, theming, or accessibility.',
  context: `
# Building UI with NVIDIA Elements

Elements is NVIDIA's design system for AI and Robotics applications, built for speed and scale. It provides a comprehensive library of web components (nve-*) that work across any framework. Elements covers the full spectrum of UI needs: layout primitives, typography, form controls, data grids, navigation, dialogs, theming, and accessibility.
${toolsContext}
${authoringContext}
${playgroundContext}
${integrationContext}`
};

export const prompts: Prompt[] = [
  aboutPrompt,
  doctorPrompt,
  searchPrompt,
  playgroundPrompt,
  createProjectPrompt,
  migrateProjectPrompt
];

export const skills: Skill[] = [elementsSkill];
