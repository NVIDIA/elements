import { PlaygroundService } from './playground/service.js';
import { ExamplesService } from './examples/service.js';
import { ApiService } from './api/service.js';
import { PackagesService } from './packages/service.js';
import { ProjectService } from './project/service.js';
import { loadTools } from './internal/tools.js';

export const VERSION = '0.0.0';

export {
  type ToolOutput,
  type ToolMethod,
  type ManagedToolMethod,
  type Schema,
  type ToolSupportFlags,
  ToolSupport,
  jsonSchemaToZod
} from './internal/tools.js';

export { getNPMClient } from './internal/node.js';
export { type Report, type ReportCheck } from './internal/types.js';

export const tools = [ApiService, ExamplesService, PlaygroundService, ProjectService, PackagesService].flatMap(
  service => loadTools(service)
);

// temporary exports
export { getElementImports } from './internal/utils.js';
export { prompts } from './context/index.js';
