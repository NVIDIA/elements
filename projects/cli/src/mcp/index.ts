// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

/* istanbul ignore file -- @preserve */
import { McpServer, type ServerContext, type ToolAnnotations } from '@modelcontextprotocol/server';
import { serveStdio } from '@modelcontextprotocol/server/stdio';
import { tools, prompts, jsonSchemaToZod, ToolSupport } from '@internals/tools';
import z from 'zod';
import { MCP_UI_MIME_TYPE, uiResources } from './ui/index.js';

const VERSION = '0.0.0';

function getObjectSchema(schema: Parameters<typeof jsonSchemaToZod>[0] | undefined) {
  if (!schema) return z.object({});
  const zodSchema = jsonSchemaToZod(schema);
  if (!(zodSchema instanceof z.ZodObject)) {
    throw new TypeError('Expected an object JSON Schema');
  }
  return zodSchema;
}

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

function attachProgress(params: Record<string, unknown>, ctx: ServerContext): void {
  const progressToken = ctx.mcpReq._meta?.progressToken;
  if (progressToken === undefined) return;
  let progressCount = 0;
  params.onProgress = (message: string) => {
    progressCount++;
    ctx.mcpReq
      .notify({
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
      const inputSchema = getObjectSchema(tool.metadata.inputSchema);
      const resultSchema = tool.metadata.outputSchema ? jsonSchemaToZod(tool.metadata.outputSchema) : z.any();
      const config = {
        title,
        inputSchema,
        outputSchema: z.object({
          status: z.enum(['complete', 'error']).optional(),
          message: z.string().optional(),
          result: resultSchema.optional()
        }),
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
      server.registerTool(toolName, config, async (params, ctx) => {
        attachProgress(params as Record<string, unknown>, ctx);
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
    const argsSchema = getObjectSchema(prompt.argsSchema);
    const config = { title: prompt.title, description: prompt.description, argsSchema };
    server.registerPrompt(prompt.name, config, async params => prompt.handler(params));
  });
}

export function startMcpServer() {
  process.env.ELEMENTS_ENV = 'mcp';

  return serveStdio(
    () => {
      const server = new McpServer({
        name: 'io.github.NVIDIA/elements',
        version: VERSION,
        description:
          'NVIDIA Elements UI Design System (nve-*), custom element schemas, APIs and examples. Use the "elements" skill for more guidance if available.'
      });

      registerCapabilities(server);
      registerResources(server);
      registerTools(server);
      registerPrompts(server);

      return server;
    },
    {
      onerror(error) {
        console.error(error);
        process.exit(1);
      }
    }
  );
}
