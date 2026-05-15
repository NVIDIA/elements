// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

const {
  mockRegisterTool,
  mockRegisterPrompt,
  mockRegisterResource,
  mockRegisterCapabilities,
  mockConnect,
  mcpTool,
  cliTool,
  allTool,
  uiTool,
  mockPrompt,
  mockZodSchema
} = vi.hoisted(() => {
  const zodSchema = { shape: {}, optional: () => zodSchema };

  const createMockTool = (overrides: Record<string, unknown>) => {
    const fn = vi.fn().mockResolvedValue({ status: 'complete', result: 'test' });
    Object.assign(fn, {
      metadata: {
        support: 3,
        summary: 'Test',
        description: 'Test description',
        title: 'Test',
        toolName: 'test_tool',
        command: 'test.tool',
        inputSchema: { type: 'object', properties: { name: { type: 'string' } } },
        ...overrides
      }
    });
    return fn;
  };

  return {
    mockRegisterTool: vi.fn(),
    mockRegisterPrompt: vi.fn(),
    mockRegisterResource: vi.fn(),
    mockRegisterCapabilities: vi.fn(),
    mockConnect: vi.fn().mockResolvedValue(undefined),
    mockZodSchema: zodSchema,
    mcpTool: createMockTool({
      support: 1,
      toolName: 'mcp_tool',
      command: 'mcp.tool',
      title: 'MCP Tool',
      summary: 'MCP only',
      inputSchema: undefined
    }),
    cliTool: createMockTool({
      support: 2,
      toolName: 'cli_tool',
      command: 'cli_tool',
      title: 'CLI Tool',
      summary: 'CLI only'
    }),
    allTool: createMockTool({
      support: 3,
      toolName: 'all_tool',
      command: 'all.tool',
      title: 'All Tool',
      summary: 'All support',
      outputSchema: { type: 'string' }
    }),
    uiTool: createMockTool({
      support: 1,
      toolName: 'mcp_ui_tool',
      command: 'mcp.ui.tool',
      title: 'MCP UI Tool',
      summary: 'MCP UI-enabled tool',
      app: { resourceUri: 'ui://elements/example-preview' }
    }),
    mockPrompt: {
      name: 'test-prompt',
      title: 'Test Prompt',
      description: 'A test prompt',
      argsSchema: { type: 'object', properties: {} },
      handler: vi.fn().mockResolvedValue({ messages: [] })
    }
  };
});

vi.mock('@modelcontextprotocol/sdk/server/mcp.js', () => ({
  McpServer: vi.fn(function () {
    return {
      registerTool: mockRegisterTool,
      registerPrompt: mockRegisterPrompt,
      registerResource: mockRegisterResource,
      server: { registerCapabilities: mockRegisterCapabilities },
      connect: mockConnect
    };
  })
}));

vi.mock('@modelcontextprotocol/sdk/server/stdio.js', () => ({
  StdioServerTransport: vi.fn()
}));

vi.mock('@internals/tools', () => ({
  tools: [mcpTool, cliTool, allTool, uiTool],
  prompts: [mockPrompt],
  jsonSchemaToZod: vi.fn(() => mockZodSchema),
  ToolSupport: { None: 0, MCP: 1, CLI: 2, All: 3 }
}));

describe('MCP server', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    delete process.env.ELEMENTS_ENV;
    vi.resetModules();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should set ELEMENTS_ENV to "mcp"', async () => {
    const { startMcpServer } = await import('./mcp.js');
    await startMcpServer();
    expect(process.env.ELEMENTS_ENV).toBe('mcp');
  });

  it('should only register tools with MCP support', async () => {
    const { startMcpServer } = await import('./mcp.js');
    await startMcpServer();
    expect(mockRegisterTool).toHaveBeenCalledTimes(3);
    expect(mockRegisterTool).toHaveBeenCalledWith('mcp_tool', expect.any(Object), expect.any(Function));
    expect(mockRegisterTool).toHaveBeenCalledWith('all_tool', expect.any(Object), expect.any(Function));
    expect(mockRegisterTool).toHaveBeenCalledWith('mcp_ui_tool', expect.any(Object), expect.any(Function));
  });

  it('should not register CLI-only tools', async () => {
    const { startMcpServer } = await import('./mcp.js');
    await startMcpServer();
    const registeredNames = mockRegisterTool.mock.calls.map(call => call[0]);
    expect(registeredNames).not.toContain('cli_tool');
  });

  it('should register tools with correct config', async () => {
    const { startMcpServer } = await import('./mcp.js');
    await startMcpServer();
    const allToolCall = mockRegisterTool.mock.calls.find(call => call[0] === 'all_tool');
    expect(allToolCall[1]).toEqual(
      expect.objectContaining({
        title: 'All Tool',
        description: 'Test description'
      })
    );
  });

  it('should handle tools without inputSchema', async () => {
    const { startMcpServer } = await import('./mcp.js');
    await startMcpServer();
    // mcpTool has no inputSchema — should still register without error
    const mcpToolCall = mockRegisterTool.mock.calls.find(call => call[0] === 'mcp_tool');
    expect(mcpToolCall[1].inputSchema).toEqual({});
  });

  it('should register prompts', async () => {
    const { startMcpServer } = await import('./mcp.js');
    await startMcpServer();
    expect(mockRegisterPrompt).toHaveBeenCalledTimes(1);
    expect(mockRegisterPrompt).toHaveBeenCalledWith(
      'test-prompt',
      expect.objectContaining({
        title: 'Test Prompt',
        description: 'A test prompt'
      }),
      expect.any(Function)
    );
  });

  it('should invoke prompt handler with params', async () => {
    const { startMcpServer } = await import('./mcp.js');
    await startMcpServer();
    const handler = mockRegisterPrompt.mock.calls[0][2];
    const result = await handler({ arg: 'value' });
    expect(mockPrompt.handler).toHaveBeenCalledWith({ arg: 'value' });
    expect(result).toEqual({ messages: [] });
  });

  it('should connect to stdio transport', async () => {
    const { startMcpServer } = await import('./mcp.js');
    await startMcpServer();
    expect(mockConnect).toHaveBeenCalledTimes(1);
  });

  it('should return string result as text content', async () => {
    const { startMcpServer } = await import('./mcp.js');
    await startMcpServer();
    const handler = mockRegisterTool.mock.calls[0][2];
    const result = await handler({});
    expect(result).toEqual({
      structuredContent: { status: 'complete', result: 'test' },
      content: [{ type: 'text', text: 'test' }]
    });
  });

  it('should return JSON for error responses', async () => {
    const { startMcpServer } = await import('./mcp.js');
    await startMcpServer();
    const handler = mockRegisterTool.mock.calls[0][2];
    const errorResult = { status: 'error', message: 'failed' };
    mcpTool.mockResolvedValueOnce(errorResult);
    const result = await handler({});
    expect(result.content[0].text).toBe(JSON.stringify(errorResult));
  });

  it('should return JSON for non-string results', async () => {
    const { startMcpServer } = await import('./mcp.js');
    await startMcpServer();
    const handler = mockRegisterTool.mock.calls[0][2];
    const objResult = { status: 'complete', result: { key: 'value' } };
    mcpTool.mockResolvedValueOnce(objResult);
    const result = await handler({});
    expect(result.content[0].text).toBe(JSON.stringify(objResult));
  });

  it('should advertise the io.modelcontextprotocol/ui extension capability', async () => {
    const { startMcpServer } = await import('./mcp.js');
    await startMcpServer();
    expect(mockRegisterCapabilities).toHaveBeenCalledWith({
      extensions: { 'io.modelcontextprotocol/ui': { mimeTypes: ['text/html;profile=mcp-app'] } }
    });
  });

  it('should register the MCP UI resources', async () => {
    const { startMcpServer } = await import('./mcp.js');
    await startMcpServer();
    [
      {
        name: 'nve-mcp-examples-render',
        uri: 'ui://elements/example-preview',
        title: 'Elements Example Preview'
      },
      {
        name: 'nve-mcp-api-icons-list',
        uri: 'ui://elements/icons-list',
        title: 'Elements Icons List'
      },
      {
        name: 'nve-mcp-api-tokens-list',
        uri: 'ui://elements/tokens-list',
        title: 'Elements Token Explorer'
      }
    ].forEach(({ name, uri, title }) => {
      const resourceCall = mockRegisterResource.mock.calls.find(call => call[0] === name);
      expect(resourceCall).toBeDefined();
      const [, registeredUri, config, handler] = resourceCall!;
      expect(registeredUri).toBe(uri);
      expect(config).toMatchObject({ mimeType: 'text/html;profile=mcp-app' });
      const result = handler();
      expect(result.contents[0]).toMatchObject({
        uri,
        mimeType: 'text/html;profile=mcp-app'
      });
      expect(result.contents[0].text).toContain('<!doctype html>');
      expect(result.contents[0].text).toContain(`<title>${title}</title>`);
    });
  });

  it('should restrict MCP UI messages to the expected parent origin', async () => {
    const { startMcpServer } = await import('./mcp.js');
    await startMcpServer();
    const resourceCall = mockRegisterResource.mock.calls.find(call => call[0] === 'nve-mcp-examples-render');
    const [, , , handler] = resourceCall!;
    const result = handler();
    const html = result.contents[0].text;

    expect(html).toContain('window.parent.postMessage(msg, expectedOrigin)');
    expect(html).toContain('#getExpectedParentOrigin()');
    expect(html).toContain('#isAllowedParentOrigin(origin)');
    expect(html).toContain("origin !== 'null'");
    expect(html).not.toContain("window.parent.postMessage(msg, '*')");
  });

  it('should keep the example preview element decoupled from the MCP UI client', async () => {
    const { startMcpServer } = await import('./mcp.js');
    await startMcpServer();
    const resourceCall = mockRegisterResource.mock.calls.find(call => call[0] === 'nve-mcp-examples-render');
    const [, , , handler] = resourceCall!;
    const result = handler();
    const html = result.contents[0].text;
    const elementScript = html.slice(
      html.indexOf('class ElementsExamplePreview'),
      html.indexOf("customElements.define('nve-mcp-examples-render'")
    );
    const clientScript = html.slice(html.indexOf('const client = new Client'));

    expect(elementScript).not.toContain('callServerTool');
    expect(elementScript).not.toContain('handleToolInput');
    expect(elementScript).not.toContain('handleToolResult');
    expect(elementScript).not.toContain('structuredContent');
    expect(elementScript).not.toMatch(/this\.client\s*=/);
    expect(clientScript).toContain('client.callServerTool');
    expect(clientScript).toContain("name: 'examples_get'");
    expect(clientScript).toContain('lintMessages');
    expect(clientScript).not.toContain('preview.template = pendingTemplate');
  });

  it('should keep the icons list element decoupled from the MCP UI client', async () => {
    const { startMcpServer } = await import('./mcp.js');
    await startMcpServer();
    const resourceCall = mockRegisterResource.mock.calls.find(call => call[0] === 'nve-mcp-api-icons-list');
    const [, , , handler] = resourceCall!;
    const result = handler();
    const html = result.contents[0].text;
    const elementScript = html.slice(
      html.indexOf('class ElementsIconsList'),
      html.indexOf("customElements.define('nve-mcp-api-icons-list'")
    );
    const clientScript = html.slice(html.indexOf('const client = new Client'));

    expect(elementScript).toContain("new CustomEvent('icons-request'");
    expect(elementScript).not.toContain('callServerTool');
    expect(elementScript).not.toContain('handleToolResult');
    expect(elementScript).not.toContain('structuredContent');
    expect(elementScript).not.toMatch(/this\.client\s*=/);
    expect(clientScript).toContain('client.callServerTool');
    expect(clientScript).toContain("iconList.addEventListener('icons-request'");
  });

  it('should keep the tokens list element decoupled from the MCP UI client', async () => {
    const { startMcpServer } = await import('./mcp.js');
    await startMcpServer();
    const resourceCall = mockRegisterResource.mock.calls.find(call => call[0] === 'nve-mcp-api-tokens-list');
    const [, , , handler] = resourceCall!;
    const result = handler();
    const html = result.contents[0].text;
    const elementScript = html.slice(
      html.indexOf('class ElementsTokensList'),
      html.indexOf("customElements.define('nve-mcp-api-tokens-list'")
    );
    const clientScript = html.slice(html.indexOf('const client = new Client'));

    expect(elementScript).toContain("new CustomEvent('tokens-request'");
    expect(elementScript).not.toContain('callServerTool');
    expect(elementScript).not.toContain('handleToolInput');
    expect(elementScript).not.toContain('handleToolResult');
    expect(elementScript).not.toContain('structuredContent');
    expect(elementScript).not.toMatch(/this\.client\s*=/);
    expect(clientScript).toContain('client.callServerTool');
    expect(clientScript).toContain("tokenList.addEventListener('tokens-request'");
  });

  it('should attach _meta.ui to tools that declare MCP UI metadata', async () => {
    const { startMcpServer } = await import('./mcp.js');
    await startMcpServer();
    const uiToolCall = mockRegisterTool.mock.calls.find(call => call[0] === 'mcp_ui_tool');
    expect(uiToolCall![1]._meta).toEqual({ ui: { resourceUri: 'ui://elements/example-preview' } });
  });

  it('should leave _meta undefined for tools without MCP UI metadata', async () => {
    const { startMcpServer } = await import('./mcp.js');
    await startMcpServer();
    const mcpToolCall = mockRegisterTool.mock.calls.find(call => call[0] === 'mcp_tool');
    expect(mcpToolCall![1]._meta).toBeUndefined();
  });

  it('should exit on connection error', async () => {
    mockConnect.mockRejectedValueOnce(new Error('Connection failed'));
    const exitSpy = vi.spyOn(process, 'exit').mockImplementation(() => undefined as never);
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const { startMcpServer } = await import('./mcp.js');
    await startMcpServer();

    expect(errorSpy).toHaveBeenCalledWith(expect.any(Error));
    expect(exitSpy).toHaveBeenCalledWith(1);
  });
});
