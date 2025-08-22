import { PlaygroundService } from './playground/service.js';
import { ExamplesService } from './examples/service.js';
import { ApiService } from './api/service.js';
import { ChangelogsService } from './changelogs/service.js';
import { ProjectService } from './project/service.js';
import { TokensService } from './tokens/service.js';
import { loadTools } from './internal/tools.js';

export const VERSION = '0.0.0';

export {
  type ToolOutput,
  type ToolMethod,
  type ManagedToolMethod,
  type Schema,
  jsonSchemaToZod
} from './internal/tools.js';

export const tools = [
  ApiService,
  ChangelogsService,
  ExamplesService,
  PlaygroundService,
  ProjectService,
  TokensService
].flatMap(service => loadTools(service));

// temporary exports
export { getElementImports } from './internal/utils.js';
export { prompts } from './internal/prompts.js';
