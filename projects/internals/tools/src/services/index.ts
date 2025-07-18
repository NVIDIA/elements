import { loadTools } from '../utils/tools.js';
import { StarterService } from './starter.service.js';
import { PlaygroundService } from './playground.service.js';
import { ExampleService } from './example.service.js';
import { ApiService } from './api.service.js';
import { HealthService } from './health.service.js';

export const tools = [ApiService, PlaygroundService, StarterService, ExampleService, HealthService].flatMap(service =>
  loadTools(service)
);
