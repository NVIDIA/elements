import { registerAppResource, registerAppTool, RESOURCE_MIME_TYPE } from '@modelcontextprotocol/ext-apps/server';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { CallToolResult, ReadResourceResult } from '@modelcontextprotocol/sdk/types.js';
import { readFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { z } from 'zod';

const APP_RESOURCE_URI = 'ui://hello/mcp-app.html';
const APP_HTML_PATH = join(dirname(fileURLToPath(import.meta.url)), 'mcp-app.html');
const GREETING_PREFIX = 'Hello from an Elements MCP App.';

let callCount = 0;

export function createServer(): McpServer {
  const server = new McpServer({
    name: 'elements-mcp-app',
    version: '0.0.0'
  });

  registerAppTool(
    server,
    'hello',
    {
      title: 'Hello',
      description: 'Show a minimal Elements MCP App with an optional custom greeting.',
      inputSchema: {
        greeting: z.string().trim().optional().describe('Greeting text to display in the app.')
      },
      _meta: { ui: { resourceUri: APP_RESOURCE_URI } }
    },
    async ({ greeting }): Promise<CallToolResult> => {
      const greetingText = createGreeting(greeting);
      return {
        content: [{ type: 'text', text: greetingText }],
        structuredContent: { greeting: greetingText }
      };
    }
  );

  registerAppResource(
    server,
    'Elements MCP App',
    APP_RESOURCE_URI,
    { description: 'Minimal Elements MCP App UI.', mimeType: RESOURCE_MIME_TYPE },
    async (): Promise<ReadResourceResult> => ({
      contents: [
        {
          uri: APP_RESOURCE_URI,
          mimeType: RESOURCE_MIME_TYPE,
          text: await readFile(APP_HTML_PATH, 'utf8')
        }
      ]
    })
  );

  return server;
}

function createGreeting(greeting?: string) {
  callCount += 1;
  if (greeting) return greeting;

  return `${GREETING_PREFIX} Server call ${callCount} at ${new Date().toLocaleTimeString()}.`;
}
