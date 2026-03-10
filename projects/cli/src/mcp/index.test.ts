import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

const { mockRegisterTool, mockRegisterPrompt, mockConnect, mcpTool, cliTool, allTool, mockPrompt, mockZodSchema } =
  vi.hoisted(() => {
    const mockRegisterTool = vi.fn();
    const mockRegisterPrompt = vi.fn();
    const mockConnect = vi.fn().mockResolvedValue(undefined);
    const mockZodSchema = { shape: {}, optional: () => mockZodSchema };

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

    const mcpTool = createMockTool({
      support: 1,
      toolName: 'mcp_tool',
      command: 'mcp.tool',
      title: 'MCP Tool',
      summary: 'MCP only',
      inputSchema: undefined
    });

    const cliTool = createMockTool({
      support: 2,
      toolName: 'cli_tool',
      command: 'cli_tool',
      title: 'CLI Tool',
      summary: 'CLI only'
    });

    const allTool = createMockTool({
      support: 3,
      toolName: 'all_tool',
      command: 'all.tool',
      title: 'All Tool',
      summary: 'All support',
      outputSchema: { type: 'string' }
    });

    const mockPrompt = {
      name: 'test-prompt',
      title: 'Test Prompt',
      description: 'A test prompt',
      argsSchema: { type: 'object', properties: {} },
      handler: vi.fn().mockResolvedValue({ messages: [] })
    };

    return { mockRegisterTool, mockRegisterPrompt, mockConnect, mcpTool, cliTool, allTool, mockPrompt, mockZodSchema };
  });

vi.mock('@modelcontextprotocol/sdk/server/mcp.js', () => ({
  McpServer: vi.fn(function () {
    return {
      registerTool: mockRegisterTool,
      registerPrompt: mockRegisterPrompt,
      connect: mockConnect
    };
  })
}));

vi.mock('@modelcontextprotocol/sdk/server/stdio.js', () => ({
  StdioServerTransport: vi.fn()
}));

vi.mock('@internals/tools', () => ({
  tools: [mcpTool, cliTool, allTool],
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
    await import('./index.js');
    expect(process.env.ELEMENTS_ENV).toBe('mcp');
  });

  it('should only register tools with MCP support', async () => {
    await import('./index.js');
    expect(mockRegisterTool).toHaveBeenCalledTimes(2);
    expect(mockRegisterTool).toHaveBeenCalledWith('mcp_tool', expect.any(Object), expect.any(Function));
    expect(mockRegisterTool).toHaveBeenCalledWith('all_tool', expect.any(Object), expect.any(Function));
  });

  it('should not register CLI-only tools', async () => {
    await import('./index.js');
    const registeredNames = mockRegisterTool.mock.calls.map(call => call[0]);
    expect(registeredNames).not.toContain('cli_tool');
  });

  it('should register tools with correct config', async () => {
    await import('./index.js');
    const allToolCall = mockRegisterTool.mock.calls.find(call => call[0] === 'all_tool');
    expect(allToolCall[1]).toEqual(
      expect.objectContaining({
        title: 'All Tool',
        description: 'Test description'
      })
    );
  });

  it('should handle tools without inputSchema', async () => {
    await import('./index.js');
    // mcpTool has no inputSchema — should still register without error
    const mcpToolCall = mockRegisterTool.mock.calls.find(call => call[0] === 'mcp_tool');
    expect(mcpToolCall[1].inputSchema).toEqual({});
  });

  it('should register prompts', async () => {
    await import('./index.js');
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
    await import('./index.js');
    const handler = mockRegisterPrompt.mock.calls[0][2];
    const result = await handler({ arg: 'value' });
    expect(mockPrompt.handler).toHaveBeenCalledWith({ arg: 'value' });
    expect(result).toEqual({ messages: [] });
  });

  it('should connect to stdio transport', async () => {
    await import('./index.js');
    expect(mockConnect).toHaveBeenCalledTimes(1);
  });

  it('should return string result as text content', async () => {
    await import('./index.js');
    const handler = mockRegisterTool.mock.calls[0][2];
    const result = await handler({});
    expect(result).toEqual({
      structuredContent: { status: 'complete', result: 'test' },
      content: [{ type: 'text', text: 'test' }]
    });
  });

  it('should return JSON for error responses', async () => {
    await import('./index.js');
    const handler = mockRegisterTool.mock.calls[0][2];
    const errorResult = { status: 'error', message: 'failed' };
    mcpTool.mockResolvedValueOnce(errorResult);
    const result = await handler({});
    expect(result.content[0].text).toBe(JSON.stringify(errorResult));
  });

  it('should return JSON for non-string results', async () => {
    await import('./index.js');
    const handler = mockRegisterTool.mock.calls[0][2];
    const objResult = { status: 'complete', result: { key: 'value' } };
    mcpTool.mockResolvedValueOnce(objResult);
    const result = await handler({});
    expect(result.content[0].text).toBe(JSON.stringify(objResult));
  });

  it('should exit on connection error', async () => {
    mockConnect.mockRejectedValueOnce(new Error('Connection failed'));
    const exitSpy = vi.spyOn(process, 'exit').mockImplementation(() => undefined as never);
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    await import('./index.js');

    expect(errorSpy).toHaveBeenCalledWith(expect.any(Error));
    expect(exitSpy).toHaveBeenCalledWith(1);
  });
});
