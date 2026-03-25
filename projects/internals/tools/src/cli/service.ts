import { tool, service, ToolSupport } from '../internal/tools.js';
import type { Report } from '../internal/types.js';
import { jsonReportSchema } from '../internal/schema.js';
import { performUpgrade, type ProgressCallback } from './utils.js';

@service()
export class CliService {
  @tool({
    summary: 'Upgrade the Elements CLI (nve) to the latest version.',
    description:
      'Downloads and installs the latest version of the nve CLI. On macOS/Linux this runs the install script, on Windows it runs the install command.',
    support: ToolSupport.MCP,
    annotations: {
      destructiveHint: true,
      idempotentHint: true,
      openWorldHint: true
    },
    outputSchema: jsonReportSchema
  })
  static async upgrade(args?: { onProgress?: ProgressCallback }): Promise<Report> {
    return performUpgrade(args?.onProgress);
  }
}
