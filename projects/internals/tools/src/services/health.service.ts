import { cwd } from 'node:process';
import { readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { data } from './data.js';
import { tool, service } from '../utils/tools.js';
import { getVersionHealth } from '../utils/health.js';
import { getLatestPublishedVersions } from '../utils/api.js';

@service()
export class HealthService {
  @tool({
    description: 'Check the health of a project using @nve packages.',
    inputSchema: {
      type: 'object',
      properties: {
        cwd: {
          type: 'string',
          description: 'Provide the current working directory.',
          default: cwd()
        }
      }
    }
  })
  static async check({
    cwd
  }: {
    cwd: string;
  }): Promise<Record<string, { version: string; latest: string; status: 'success' | 'warning' | 'danger' }>> {
    const packageJson = JSON.parse(readFileSync(resolve(join(cwd, 'package.json')), 'utf8'));
    const currentVersions = await getLatestPublishedVersions(data);
    return await getVersionHealth(packageJson, currentVersions);
  }
}
