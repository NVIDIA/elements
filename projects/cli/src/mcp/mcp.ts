/* istanbul ignore file -- @preserve */
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { tools, prompts, jsonSchemaToZod, ToolSupport } from '@internals/tools';
import z, { type ZodObject } from 'zod';
import { type ToolAnnotations } from '@modelcontextprotocol/sdk/types.js';

export const VERSION = '0.0.0';
export const BUILD_SHA = '__NVE_BUILD_CHECKSUM__';

export async function startMcpServer() {
  process.env.ELEMENTS_ENV = 'mcp';

  const server = new McpServer({
    name: 'nve-mcp',
    version: VERSION,
    description:
      'NVIDIA Elements UI Design System (nve-*), custom element schemas, APIs and examples. Use the "elements" skill for more guidance if available.'
  });

  tools
    .filter(tool => tool.metadata.support & ToolSupport.MCP)
    .forEach(tool => {
      const { summary, description, title, toolName } = tool.metadata;
      const inputSchema = tool.metadata.inputSchema
        ? (jsonSchemaToZod(tool.metadata.inputSchema) as ZodObject<{}>).shape
        : {};
      const resultSchema = tool.metadata.outputSchema ? jsonSchemaToZod(tool.metadata.outputSchema) : z.any();
      const outputSchema = {
        status: z.enum(['complete', 'error']).optional(),
        message: z.string().optional(),
        result: resultSchema.optional()
      };

      const config = {
        title,
        inputSchema,
        outputSchema,
        description: description ? description : summary,
        annotations: {
          title,
          readOnlyHint: true, // If true, the tool does not change its environment
          idempotentHint: true, // If true, repeated calls with same args have no extra effect
          destructiveHint: false, // If true, the tool may perform destructive/irreversible updates
          openWorldHint: false, // If true, tool interacts with external entities
          ...tool.metadata.annotations
        } as ToolAnnotations
      };
      server.registerTool(toolName, config, async params => {
        const structuredContent = (await tool(params)) as unknown as { [x: string]: unknown };
        // https://github.com/modelcontextprotocol/modelcontextprotocol/issues/1624
        const text =
          typeof structuredContent.result === 'string' && structuredContent.status !== 'error'
            ? structuredContent.result
            : JSON.stringify(structuredContent);
        return { structuredContent, content: [{ type: 'text', text }] };
      });
    });

  prompts.forEach(prompt => {
    const argsSchema = (jsonSchemaToZod(prompt.argsSchema ?? {}) as ZodObject<{}>).shape;
    const config = { title: prompt.title, description: prompt.description, argsSchema };
    server.registerPrompt(prompt.name, config, async params => prompt.handler(params));
  });

  try {
    await server.connect(new StdioServerTransport());
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}
