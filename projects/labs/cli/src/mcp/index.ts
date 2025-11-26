#!/usr/bin/env node
process.env.ELEMENTS_ENV = 'mcp';

/* istanbul ignore file -- @preserve */
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { tools, prompts, jsonSchemaToZod } from '@nve-internals/tools';
import z, { type ZodObject } from 'zod';

export const VERSION = '0.0.0';

const server = new McpServer({ name: 'nve-mcp', version: VERSION });

tools.forEach(tool => {
  const { description, title, toolName } = tool.metadata;
  const inputSchema = (jsonSchemaToZod(tool.metadata.inputSchema) as ZodObject<{}>).shape;
  const resultSchema = tool.metadata.outputSchema ? jsonSchemaToZod(tool.metadata.outputSchema) : z.any();
  const outputSchema = {
    status: z.enum(['complete', 'error']).optional(),
    message: z.string().optional(),
    result: resultSchema
  };
  const config = { title, inputSchema, outputSchema, description: `Elements: ${description}` };
  server.registerTool(toolName, config, async params => {
    const structuredContent = (await tool(params)) as unknown as { [x: string]: unknown };
    return { structuredContent, content: [{ type: 'text', text: JSON.stringify(structuredContent) }] };
  });
});

prompts.forEach(prompt => {
  const argsSchema = jsonSchemaToZod(prompt.argsSchema).shape;
  const config = { title: prompt.title, description: prompt.description, argsSchema };
  server.registerPrompt(prompt.name, config, async params => prompt.handler(params));
});

try {
  await server.connect(new StdioServerTransport());
} catch (error) {
  console.error(error);
  process.exit(1);
}
