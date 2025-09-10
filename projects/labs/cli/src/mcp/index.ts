#!/usr/bin/env node
/* istanbul ignore file -- @preserve */
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { tools, prompts, jsonSchemaToZod } from '@nve-internals/tools';
import z, { type ZodObject } from 'zod';

process.env.ELEMENTS_ENV = 'mcp';

const server = new McpServer({ name: 'nve-mcp', version: '0.0.0' });

tools.forEach(tool => {
  const { description, title, toolName } = tool.metadata;
  const inputSchema = (jsonSchemaToZod(tool.metadata.inputSchema) as ZodObject<{}>).shape;
  const resultSchema = tool.metadata.outputSchema ? jsonSchemaToZod(tool.metadata.outputSchema) : z.any();
  const outputSchema = { status: z.enum(['success', 'error']), message: z.string().optional(), result: resultSchema };
  const config = { title, inputSchema, outputSchema, description: `Elements: ${description}` };
  server.registerTool(toolName, config, async params => {
    const structuredContent = (await tool(params)) as unknown as { [x: string]: unknown };
    return { structuredContent, content: [{ type: 'text', text: JSON.stringify(structuredContent, null, 2) }] };
  });
});

prompts.forEach(prompt => {
  const argsSchema = jsonSchemaToZod(prompt.argsSchema).shape;
  const config = { title: prompt.title, description: prompt.description, argsSchema };
  server.registerPrompt(prompt.name, config, async params => {
    return prompt.handler(params) as unknown as { [x: string]: unknown };
  });
});

try {
  await server.connect(new StdioServerTransport());
} catch (error) {
  console.error(error);
  process.exit(1);
}
