import { cwd } from 'node:process';
import { join, resolve } from 'node:path';
import { tool, service } from '../internal/tools.js';
import type { Report } from '../internal/types.js';
import { jsonReportSchema } from '../internal/schema.js';
import { getHealthReport } from './health.js';
import { setupAgent } from './setup-agent.js';
import { createStarter, startStarter, startersData, type Starter } from './starters.js';
import { updateProject } from './update.js';
import { setupProject } from './setup.js';

const starters = Object.keys(startersData).filter(
  starter => startersData[starter as keyof typeof startersData]?.cli
) as Starter[];

@service()
export class ProjectService {
  @tool({
    summary: 'Create a new starter project.',
    annotations: {
      destructiveHint: true,
      idempotentHint: false
    },
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
    outputSchema: jsonReportSchema
  })
  static async create({ type, cwd, start }: { type: Starter; cwd: string; start: boolean }): Promise<Report> {
    const dir = resolve(cwd);
    const projectDir = resolve(join(cwd, type));

    const createReport = await createStarter(type, dir);
    const agentReport = await setupAgent(projectDir, 'all');
    const setupProjectReport = await setupProject(projectDir);
    const updateReport = await updateProject(projectDir);
    const reports = [createReport, agentReport, setupProjectReport, updateReport];

    const failedReport = reports.find(report => Object.values(report).some(value => value.status === 'danger'));
    if (failedReport) {
      return failedReport;
    }

    if (start) {
      await startStarter(projectDir);
    }

    return {
      ...createReport,
      ...agentReport,
      ...setupProjectReport,
      ...updateReport
    };
  }

  @tool({
    summary: 'Setup or update a project to use Elements.',
    description:
      'Setup or update a project to use Elements. Configures MCP, adds core dependencies if missing, and updates packages to the latest versions. Use the packages_get tool to get package specific integration and installation steps.',
    annotations: {
      destructiveHint: true,
      idempotentHint: true
    },
    inputSchema: {
      type: 'object',
      properties: {
        cwd: {
          type: 'string',
          description: 'Provide the current working directory.',
          default: cwd()
        }
      }
    },
    outputSchema: jsonReportSchema
  })
  static async setup({ cwd }: { cwd: string }): Promise<Report> {
    const dir = resolve(cwd);
    const agentReport = await setupAgent(dir, 'all');
    const setupProjectReport = await setupProject(dir);
    const updateReport = await updateProject(dir);
    return {
      ...agentReport,
      ...setupProjectReport,
      ...updateReport
    };
  }

  @tool({
    summary: 'Validate project, check for configuration issues and dependencies.',
    description:
      'Validate project setup and check for configuration issues, outdated dependencies, or missing required packages.',
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
    },
    outputSchema: jsonReportSchema
  })
  static async validate({ cwd, type }: { cwd: string; type: 'application' | 'library' }): Promise<Report> {
    return await getHealthReport(resolve(cwd), type);
  }
}
