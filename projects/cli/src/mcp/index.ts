// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

/* istanbul ignore file -- @preserve */
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { tools, prompts, jsonSchemaToZod, ToolSupport } from '@internals/tools';
import z, { type ZodObject } from 'zod';
import { type ToolAnnotations } from '@modelcontextprotocol/sdk/types.js';
import { MCP_UI_MIME_TYPE, uiResources } from './ui/index.js';

const VERSION = '0.0.0';

function registerCapabilities(server: McpServer): void {
  server.server.registerCapabilities({
    extensions: { 'io.modelcontextprotocol/ui': { mimeTypes: [MCP_UI_MIME_TYPE] } }
  });
}

function registerResources(server: McpServer): void {
  uiResources.forEach(resource => {
    server.registerResource(
      resource.name,
      resource.resourceUri,
      { mimeType: resource.mimeType, description: resource.description },
      () => ({
        contents: [{ uri: resource.resourceUri, mimeType: resource.mimeType, text: resource.getHtml() }]
      })
    );
  });
}

function attachProgress(
  params: Record<string, unknown>,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  extra: any
): void {
  const progressToken = extra?._meta?.progressToken;
  if (progressToken === undefined) return;
  let progressCount = 0;
  params.onProgress = (message: string) => {
    progressCount++;
    extra
      .sendNotification({
        method: 'notifications/progress',
        params: { progressToken, progress: progressCount, message }
      })
      .catch(() => undefined);
  };
}

function registerTools(server: McpServer): void {
  tools
    .filter(tool => tool.metadata.support & ToolSupport.MCP)
    .forEach(tool => {
      const { summary, description, title, toolName } = tool.metadata;
      const inputSchema = tool.metadata.inputSchema
        ? (jsonSchemaToZod(tool.metadata.inputSchema) as ZodObject<Record<string, never>>).shape
        : {};
      const resultSchema = tool.metadata.outputSchema ? jsonSchemaToZod(tool.metadata.outputSchema) : z.any();
      const config = {
        title,
        inputSchema,
        outputSchema: {
          status: z.enum(['complete', 'error']).optional(),
          message: z.string().optional(),
          result: resultSchema.optional()
        },
        description: description ? description : summary,
        annotations: {
          title,
          readOnlyHint: true,
          idempotentHint: true,
          destructiveHint: false,
          openWorldHint: false,
          ...tool.metadata.annotations
        } as ToolAnnotations,
        _meta: !tool.metadata.app ? undefined : { ui: { resourceUri: tool.metadata.app.resourceUri } }
      };
      server.registerTool(toolName, config, async (params, extra) => {
        attachProgress(params as Record<string, unknown>, extra);
        const structuredContent = (await tool(params)) as unknown as { [x: string]: unknown };
        // https://github.com/modelcontextprotocol/modelcontextprotocol/issues/1624
        const text =
          typeof structuredContent.result === 'string' && structuredContent.status !== 'error'
            ? structuredContent.result
            : JSON.stringify(structuredContent);
        return { structuredContent, content: [{ type: 'text', text }] };
      });
    });
}

function registerPrompts(server: McpServer): void {
  prompts.forEach(prompt => {
    const argsSchema = (jsonSchemaToZod(prompt.argsSchema ?? {}) as ZodObject<Record<string, never>>).shape;
    const config = { title: prompt.title, description: prompt.description, argsSchema };
    server.registerPrompt(prompt.name, config, async params => prompt.handler(params));
  });
}

export async function startMcpServer() {
  process.env.ELEMENTS_ENV = 'mcp';

  const server = new McpServer({
    name: 'io.github.nvidia/elements',
    version: VERSION,
    description:
      'NVIDIA Elements UI Design System (nve-*), custom element schemas, APIs and examples. Use the "elements" skill for more guidance if available.'
  });

  registerCapabilities(server);
  registerResources(server);
  registerTools(server);
  registerPrompts(server);

  try {
    await server.connect(new StdioServerTransport());
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}
