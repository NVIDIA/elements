import { resolve } from 'node:path';
import { cwd } from 'node:process';
import { createStarter, startStarter } from '../utils/starters-create.js';
import { service, tool } from '../utils/tools.js';
import { startersData, type Starter } from '../utils/starters-data.js';

const starters = Object.keys(startersData).filter(starter => startersData[starter].cli) as Starter[];

@service()
export class StarterService {
  @tool({
    description: 'Create a new starter project.',
    inputSchema: {
      type: 'object',
      properties: {
        starter: {
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
          description: 'Run the starter project after creation.',
          default: false,
          service: true
        }
      },
      required: ['starter']
    }
  })
  static async create({ starter, cwd, start }: { starter: Starter; cwd: string; start: boolean }): Promise<string> {
    const result = await createStarter(starter, resolve(cwd));
    if (start) {
      await startStarter(starter);
    }
    return result;
  }
}
