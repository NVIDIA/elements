import { StarterService } from './starter/service.js';
import { PlaygroundService } from './playground/service.js';
import { ExampleService } from './example/service.js';
import { ApiService } from './api/service.js';
import { HealthService } from './health/service.js';
import { loadTools } from './internal/tools.js';

export const VERSION = '0.0.0';

export { type ToolOutput, type ToolMethod, jsonSchemaToZodMCP } from './internal/tools.js';

export const tools = [ApiService, PlaygroundService, StarterService, ExampleService, HealthService].flatMap(service =>
  loadTools(service)
);

// temporary exports
export { getElementImports } from './internal/utils.js';
