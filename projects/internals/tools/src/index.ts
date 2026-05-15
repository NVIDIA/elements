// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { PlaygroundService } from './playground/service.js';
import { ExamplesService } from './examples/service.js';
import { ApiService } from './api/service.js';
import { PackagesService } from './packages/service.js';
import { ProjectService } from './project/service.js';
import { CliService } from './cli/service.js';
import { SkillsService } from './skills/service.js';
import { loadTools } from './internal/tools.js';

export const VERSION = '0.0.0';

export {
  type ToolOutput,
  type ToolMethod,
  type ManagedToolMethod,
  type Schema,
  type ToolSupportFlags,
  type ToolApp,
  type ToolMetadata,
  ToolSupport,
  ToolError,
  jsonSchemaToZod
} from './internal/tools.js';

export { getNPMClient } from './internal/node.js';
export { readNveConfig, saveNveConfig, type NveConfig, type UpdateConfig } from './internal/config.js';
export { type Report, type ReportCheck } from './internal/types.js';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const services: any[] = [ApiService, CliService, ExamplesService, ProjectService, PackagesService, SkillsService];

if (process.env.ELEMENTS_PLAYGROUND_BASE_URL) {
  services.push(PlaygroundService);
}

export const tools = services.flatMap(service => loadTools(service));

export { MAX_CONTEXT_CHARS, MAX_CONTEXT_TOKENS, isDebug } from './internal/utils.js';

// temporary exports
export { getElementImports } from './internal/utils.js';
export { prompts, skills, type Prompt, type Skill } from './skills/index.js';
