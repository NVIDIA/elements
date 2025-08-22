import { cwd } from 'node:process';
import { resolve } from 'node:path';
import { tool, service } from '../internal/tools.js';
import type { Report } from '../internal/types.js';
import { getHealthReport } from './health.js';
import { createStarter, startStarter, startersData, type Starter } from './starters.js';
import { updateProject } from './update.js';

const starters = Object.keys(startersData).filter(starter => startersData[starter].cli) as Starter[];

@service()
export class ProjectService {
  @tool({
    description: 'Create a new starter project.',
    inputSchema: {
      type: 'object',
      properties: {
        type: {
          type: 'string',
          description: `The starter to create. ${starters.map(starter => `\`${starter}\``).join('| ')}`,
          enum: starters,
          enumNames: starters.map(starter => starter.charAt(0).toUpperCase() + starter.slice(1))
        },
        cwd: {
          type: 'string',
          description: 'Provide the current working directory.',
          default: cwd()
        },
        start: {
          type: 'boolean',
          description:
            'Run the starter project service/process after creation. This is will prevent the tool from exiting.',
          default: false,
          service: true
        }
      },
      required: ['type']
    },
    outputSchema: {
      type: 'string',
      description: 'Starter project path/directory.'
    }
  })
  static async create({ type, cwd, start }: { type: Starter; cwd: string; start: boolean }): Promise<string> {
    const result = await createStarter(type, resolve(cwd));
    if (start) {
      await startStarter(type);
    }
    return result;
  }

  @tool({
    description: 'Update a project to the latest versions of Elements packages.',
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
  static async update({ cwd }: { cwd: string }): Promise<Report> {
    return await updateProject(cwd);
  }

  @tool({
    description: 'Check the health of a project using Elements packages.',
    inputSchema: {
      type: 'object',
      properties: {
        cwd: {
          type: 'string',
          description: 'Provide the current working directory.',
          default: cwd()
        },
        type: {
          type: 'string',
          description: 'Type of project to check.',
          enum: ['application', 'library']
        }
      },
      required: ['type']
    }
  })
  static async health({ cwd, type }: { cwd: string; type: 'application' | 'library' }): Promise<Report> {
    return await getHealthReport(cwd, type);
  }
}
