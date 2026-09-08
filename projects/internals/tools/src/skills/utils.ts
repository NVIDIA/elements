// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { createHash } from 'node:crypto';
import { mkdirSync, promises as fsp, writeFileSync } from 'node:fs';
import nodePath from 'node:path';
import { strToU8, zipSync } from 'fflate';
import { skills, type Skill } from './registry.js';

export const AGENT_SKILLS_DISCOVERY_SCHEMA = 'https://schemas.agentskills.io/discovery/0.2.0/schema.json' as const;

const SKILL_NAME_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const MAX_SKILL_NAME_LENGTH = 64;
const MAX_SKILL_DESCRIPTION_LENGTH = 1024;

export interface AgentSkillDiscoveryEntry {
  name: string;
  type: 'skill-md' | 'archive';
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
  files: Map<string, string | Uint8Array>;
}

const ZIP_MTIME = new Date(1980, 0, 2);

function getSkillFiles(skill: Skill): [string, string][] {
  return Object.entries(skill.files).sort(([a], [b]) => a.localeCompare(b));
}

export function getSkillMarkdown(skill: Skill): string {
  const markdown = skill.files['SKILL.md'];
  if (typeof markdown !== 'string') {
    throw new Error(`Agent Skill ${JSON.stringify(skill.name)} must include SKILL.md.`);
  }
  return markdown;
}

function validateSkillFilePath(skillName: string, filePath: string): void {
  const normalized = nodePath.posix.normalize(filePath);
  if (
    !filePath ||
    filePath.includes('\\') ||
    nodePath.posix.isAbsolute(filePath) ||
    normalized !== filePath ||
    normalized === '..' ||
    normalized.startsWith('../')
  ) {
    throw new Error(`Invalid file path ${JSON.stringify(filePath)} for Agent Skill ${JSON.stringify(skillName)}.`);
  }
}

function validateSkillDirectory(skillDirectory: string, skill: Skill): void {
  if (nodePath.basename(nodePath.resolve(skillDirectory)) !== skill.name) {
    throw new Error(`Agent Skill directory must end with ${JSON.stringify(skill.name)}.`);
  }
}

function getSkillArchive(skill: Skill): Uint8Array {
  const files = Object.fromEntries(getSkillFiles(skill).map(([filePath, content]) => [filePath, strToU8(content)]));
  return zipSync(files, { level: 9, mtime: ZIP_MTIME });
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

function validateSkillMetadata(skill: Skill): void {
  validateSkillDescription(skill.name, skill.description);
  if (typeof skill.title !== 'string' || skill.title.trim().length === 0) {
    throw new Error(`Invalid Agent Skill title for ${JSON.stringify(skill.name)}.`);
  }
}

function validateSkillFiles(skill: Skill): void {
  const skillFiles = getSkillFiles(skill);
  if (skillFiles.length === 0) {
    throw new Error(`Agent Skill ${JSON.stringify(skill.name)} must include files.`);
  }
  for (const [filePath, content] of skillFiles) {
    validateSkillFilePath(skill.name, filePath);
    if (typeof content !== 'string') {
      throw new Error(`Invalid content for ${JSON.stringify(filePath)} in Agent Skill ${JSON.stringify(skill.name)}.`);
    }
  }
}

function validateSkillFrontmatter(skill: Skill): void {
  const markdown = getSkillMarkdown(skill);
  const expectedMetadata = [
    ['name', skill.name],
    ['description', skill.description],
    ['title', skill.title]
  ] as const;
  for (const [field, value] of expectedMetadata) {
    if (!markdown.includes(`${field}: ${JSON.stringify(value)}`)) {
      throw new Error(
        `Agent Skill ${JSON.stringify(skill.name)} frontmatter ${field} does not match its registry entry.`
      );
    }
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
    validateSkillMetadata(skill);
    validateSkillFiles(skill);
    validateSkillFrontmatter(skill);
  }
}

export function createAgentSkillArtifacts(skillEntries: readonly Skill[] = skills): AgentSkillArtifacts {
  validateSkillEntries(skillEntries);

  const files = new Map<string, string | Uint8Array>();
  const entries: AgentSkillDiscoveryEntry[] = [...skillEntries]
    .sort((a, b) => a.name.localeCompare(b.name))
    .map(skill => {
      const skillFiles = getSkillFiles(skill);
      const isArchive = skillFiles.length > 1;
      const artifact = isArchive ? getSkillArchive(skill) : getSkillMarkdown(skill);
      const type = isArchive ? 'archive' : 'skill-md';
      const url = isArchive ? `${skill.name}.zip` : `${skill.name}/SKILL.md`;
      files.set(url, artifact);

      return {
        name: skill.name,
        type,
        description: skill.description,
        url,
        digest: `sha256:${createHash('sha256').update(artifact).digest('hex')}`
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

export function writeSkillDirectorySync(skillDirectory: string, skill: Skill): string[] {
  validateSkillEntries([skill]);
  validateSkillDirectory(skillDirectory, skill);
  mkdirSync(skillDirectory, { recursive: true });

  return getSkillFiles(skill).map(([relativePath, content]) => {
    const filePath = nodePath.join(skillDirectory, relativePath);
    mkdirSync(nodePath.dirname(filePath), { recursive: true });
    writeFileSync(filePath, content, 'utf8');
    return filePath;
  });
}

export async function writeSkillDirectory(skillDirectory: string, skill: Skill): Promise<string[]> {
  validateSkillEntries([skill]);
  validateSkillDirectory(skillDirectory, skill);
  await fsp.mkdir(skillDirectory, { recursive: true });

  const paths: string[] = [];
  for (const [relativePath, content] of getSkillFiles(skill)) {
    const filePath = nodePath.join(skillDirectory, relativePath);
    await fsp.mkdir(nodePath.dirname(filePath), { recursive: true });
    await fsp.writeFile(filePath, content, 'utf8');
    paths.push(filePath);
  }
  return paths;
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
