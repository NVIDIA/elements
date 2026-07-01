// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { createHash } from 'node:crypto';
import { promises as fsp } from 'node:fs';
import nodePath from 'node:path';
import { skills, type Skill } from './registry.js';

export const AGENT_SKILLS_DISCOVERY_SCHEMA = 'https://schemas.agentskills.io/discovery/0.2.0/schema.json' as const;

const SKILL_NAME_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const MAX_SKILL_NAME_LENGTH = 64;
const MAX_SKILL_DESCRIPTION_LENGTH = 1024;

export interface AgentSkillDiscoveryEntry {
  name: string;
  type: 'skill-md';
  description: string;
  url: string;
  digest: string;
}

export interface AgentSkillDiscoveryIndex {
  $schema: typeof AGENT_SKILLS_DISCOVERY_SCHEMA;
  skills: AgentSkillDiscoveryEntry[];
}

export interface AgentSkillArtifacts {
  index: AgentSkillDiscoveryIndex;
  files: Map<string, string>;
}

function formatYamlString(value: string): string {
  return JSON.stringify(value);
}

export function formatSkillMarkdown(skill: Skill): string {
  return `---
name: ${formatYamlString(skill.name)}
description: ${formatYamlString(skill.description)}
license: "Apache-2.0"
metadata:
  title: ${formatYamlString(skill.title)}
---

${skill.context.trim()}
`;
}

export function validateSkillName(name: unknown): asserts name is string {
  if (typeof name !== 'string' || name.length > MAX_SKILL_NAME_LENGTH || !SKILL_NAME_PATTERN.test(name)) {
    throw new Error(
      `Invalid Agent Skill name ${JSON.stringify(name)}: use 1 to 64 lowercase letters, numbers, and single hyphens.`
    );
  }
}

export function validateSkillDescription(name: string, description: unknown): asserts description is string {
  if (
    typeof description !== 'string' ||
    description.trim().length === 0 ||
    description.length > MAX_SKILL_DESCRIPTION_LENGTH
  ) {
    throw new Error(`Invalid Agent Skill description for ${JSON.stringify(name)}: use 1 to 1,024 characters.`);
  }
}

export function validateSkillEntries(skillEntries: readonly Skill[] = skills): void {
  const names = new Set<string>();

  for (const skill of skillEntries) {
    const name = skill?.name;
    validateSkillName(name);
    if (names.has(name)) {
      throw new Error(`Duplicate Agent Skill name ${JSON.stringify(name)}.`);
    }
    names.add(name);
    validateSkillDescription(name, skill.description);
  }
}

export function createAgentSkillArtifacts(skillEntries: readonly Skill[] = skills): AgentSkillArtifacts {
  validateSkillEntries(skillEntries);

  const files = new Map<string, string>();
  const entries: AgentSkillDiscoveryEntry[] = [...skillEntries]
    .sort((a, b) => a.name.localeCompare(b.name))
    .map(skill => {
      const markdown = formatSkillMarkdown(skill);
      const url = `${skill.name}/SKILL.md`;
      files.set(url, markdown);

      return {
        name: skill.name,
        type: 'skill-md',
        description: skill.description,
        url,
        digest: `sha256:${createHash('sha256').update(Buffer.from(markdown, 'utf8')).digest('hex')}`
      };
    });

  return {
    index: {
      $schema: AGENT_SKILLS_DISCOVERY_SCHEMA,
      skills: entries
    },
    files
  };
}

export async function writeAgentSkillArtifacts(
  publicOutputPath: string,
  skillEntries: readonly Skill[] = skills
): Promise<AgentSkillArtifacts> {
  const outputPath = nodePath.resolve(publicOutputPath, '.well-known', 'agent-skills');
  const artifacts = createAgentSkillArtifacts(skillEntries);

  await fsp.rm(outputPath, { recursive: true, force: true });
  await fsp.mkdir(outputPath, { recursive: true });

  for (const [relativePath, content] of artifacts.files) {
    const filePath = nodePath.join(outputPath, relativePath);
    await fsp.mkdir(nodePath.dirname(filePath), { recursive: true });
    await fsp.writeFile(filePath, content, 'utf8');
  }

  await fsp.writeFile(nodePath.join(outputPath, 'index.json'), `${JSON.stringify(artifacts.index, null, 2)}\n`, 'utf8');

  return artifacts;
}
