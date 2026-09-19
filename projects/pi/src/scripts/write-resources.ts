// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { prompts, skills, writeSkillDirectory, type Prompt, type Skill } from '@internals/tools/skills';

const piToolsContext = `
## Native Elements tools in Pi

Use the native tools installed by \`@nvidia-elements/pi\` for Elements discovery and validation. Do not invoke the Elements CLI or configure MCP for capabilities listed here.

When a project or global \`elements\` skill is also available, use its design guidance and these Pi-specific instructions for tool selection.

- \`nvidia_elements_api_list\`: List components and attribute APIs.
- \`nvidia_elements_api_get\`: Get component or attribute documentation.
- \`nvidia_elements_examples_list\` and \`nvidia_elements_examples_get\`: Find and retrieve patterns and examples.
- \`nvidia_elements_api_imports_get\`: Determine ESM imports for a template.
- \`nvidia_elements_api_validate\`: Check HTML or JSON content and files.
- \`nvidia_elements_api_tokens_list\` and \`nvidia_elements_api_icons_list\`: Find design tokens and icons.
- \`nvidia_elements_packages_list\`, \`nvidia_elements_packages_get\`, and \`nvidia_elements_packages_changelogs_get\`: Inspect package integration and releases.
- \`nvidia_elements_project_validate\`: Check an Elements project.

Use Pi's built-in file tools to read, edit, and write project files. Project creation, project setup, and playground publication are not exposed as native tools; use the Elements CLI only when one of those operations is explicitly needed.
`;

const piToolNames = new Map([
  ['nve packages.changelogs.get', 'nvidia_elements_packages_changelogs_get'],
  ['nve api.imports.get', 'nvidia_elements_api_imports_get'],
  ['nve api.tokens.list', 'nvidia_elements_api_tokens_list'],
  ['nve project.validate', 'nvidia_elements_project_validate'],
  ['nve packages.list', 'nvidia_elements_packages_list'],
  ['nve packages.get', 'nvidia_elements_packages_get'],
  ['nve examples.list', 'nvidia_elements_examples_list'],
  ['nve examples.get', 'nvidia_elements_examples_get'],
  ['nve api.validate page.html', 'nvidia_elements_api_validate with paths: ["page.html"]'],
  ['nve api.validate --stdin', 'nvidia_elements_api_validate with template content'],
  ["nve api.validate 'src/**/*.html'", 'nvidia_elements_api_validate with paths: ["src/**/*.html"]'],
  ['nve api.validate', 'nvidia_elements_api_validate'],
  ['nve api.list', 'nvidia_elements_api_list'],
  ['nve api.get', 'nvidia_elements_api_get']
]);

const piDoctorContext = [
  '# Elements Pi Doctor / Setup Check',
  '',
  'Check the native Elements Pi integration:',
  '',
  '1. Call `nvidia_elements_api_list` to confirm that the extension tools are available.',
  '2. Call `nvidia_elements_project_validate` for an application or library in the current working directory.',
  '3. Confirm that `/skill:elements-pi` and the `/elements-*` workflow prompts are discoverable.',
  '4. Report actionable project diagnostics. Do not inspect or configure MCP unless the user explicitly asks for a separate MCP integration.'
].join('\n');

function adaptContextForPi(context: string): string {
  let adapted = context;
  for (const [command, toolName] of piToolNames) adapted = adapted.replaceAll(command, toolName);
  return adapted
    .replaceAll('via the Elements MCP or Elements CLI', 'with the native Elements Pi tools')
    .replaceAll('via the Elements MCP or the canonical CLI path', 'with the native Elements Pi tools')
    .replaceAll(' and configure the MCP server', '')
    .replaceAll('# or use the MCP Tool\nproject_setup', '# project setup is available through the Elements CLI in Pi');
}

function replaceToolsContextForPi(context: string): string {
  const toolsHeading = '## Elements CLI, MCP & Context';
  const nextHeading = '## Authoring Guidelines & Frontend Tasks';
  const toolsStart = context.indexOf(toolsHeading);
  const toolsEnd = context.indexOf(nextHeading, toolsStart + toolsHeading.length);
  if (toolsStart === -1 || toolsEnd === -1) {
    throw new Error('Elements skill tools context not found.');
  }
  return `${context.slice(0, toolsStart)}${piToolsContext.trim()}\n\n${context.slice(toolsEnd)}`;
}

function adaptSkillForPi(skill: Skill): Skill {
  const skillMarkdown = skill.files['SKILL.md'];
  if (!skillMarkdown) throw new Error('Elements skill must include SKILL.md.');
  if (!skill.files['references/doctor.md']) throw new Error('Elements skill must include its doctor reference.');

  const name = 'elements-pi';
  const title = 'NVIDIA Elements in Pi (nve)';
  const description = skill.description.replace('Use this skill by default', 'Use this skill in Pi');
  const files = Object.fromEntries(
    Object.entries(skill.files).map(([filePath, context]) => [filePath, adaptContextForPi(context)])
  );
  files['SKILL.md'] = adaptContextForPi(replaceToolsContextForPi(skillMarkdown))
    .replace(`name: ${JSON.stringify(skill.name)}`, `name: ${JSON.stringify(name)}`)
    .replace(`description: ${JSON.stringify(skill.description)}`, `description: ${JSON.stringify(description)}`)
    .replace(`title: ${JSON.stringify(skill.title)}`, `title: ${JSON.stringify(title)}`);
  files['references/doctor.md'] = `${piDoctorContext}\n`;
  return { ...skill, name, title, description, files };
}

function getPromptBody(prompt: Prompt): string {
  if (prompt.name === 'doctor') return piDoctorContext;
  return prompt
    .handler({})
    .messages.map(message => message.content.text)
    .join('\n\n');
}

function formatPromptMarkdown(prompt: Prompt): string {
  const body = getPromptBody(prompt);
  return `---
description: ${JSON.stringify(prompt.description)}
argument-hint: "[request]"
---

${adaptContextForPi(body).trim()}

User request: \${ARGUMENTS:-Apply this workflow to the current project.}
`;
}

const elementsSkill = skills.find(skill => skill.name === 'elements');
if (!elementsSkill) throw new Error('Elements skill not found.');

const skillOutputPath = resolve('dist/skills/elements-pi');
const promptOutputPath = resolve('dist/prompts');
await mkdir(promptOutputPath, { recursive: true });
await Promise.all([
  writeSkillDirectory(skillOutputPath, adaptSkillForPi(elementsSkill)),
  ...prompts.map(prompt =>
    writeFile(resolve(promptOutputPath, `elements-${prompt.name}.md`), formatPromptMarkdown(prompt), 'utf8')
  )
]);
