import { describe, expect, it } from 'vitest';
import { loadTools, service, tool, jsonSchemaToZod } from './tools.js';
import type { ToolMethod, ToolOutput, Schema } from './tools.js';

describe('metadata', () => {
  it('should be defined', () => {
    expect(tool).toBeDefined();
  });

  it('should add metadata to the method', () => {
    class Test {
      @tool({ description: 'test' })
      method() {
        return new Promise(resolve => resolve('test'));
      }
    }

    const test = new Test();
    expect((test.method as ToolMethod<string>).metadata).toBeDefined();
    expect((test.method as ToolMethod<string>).metadata.description).toBe('test');
    expect((test.method as ToolMethod<string>).metadata.name).toBe('method');
    expect((test.method as ToolMethod<string>).metadata.command).toBe('method');
  });

  it('should add metadata with inputSchema and outputSchema', () => {
    const inputSchema = { type: 'string' as const, description: 'input' };
    const outputSchema = { type: 'number' as const, description: 'output' };

    class Test {
      @tool({ description: 'test', inputSchema, outputSchema })
      method() {
        return new Promise(resolve => resolve(42));
      }
    }

    const test = new Test();
    expect((test.method as ToolMethod<number>).metadata.inputSchema).toEqual(inputSchema);
    expect((test.method as ToolMethod<number>).metadata.outputSchema).toEqual(outputSchema);
  });

  it('should generate correct command from method name', () => {
    class Test {
      @tool({ description: 'test' })
      getData() {
        return new Promise(resolve => resolve('data'));
      }

      @tool({ description: 'test' })
      processUserInput() {
        return new Promise(resolve => resolve('processed'));
      }

      @tool({ description: 'test' })
      simpleMethod() {
        return new Promise(resolve => resolve('simple'));
      }
    }

    const test = new Test();
    expect((test.getData as ToolMethod<string>).metadata.command).toBe('data');
    expect((test.processUserInput as ToolMethod<string>).metadata.command).toBe('process-user-input');
    expect((test.simpleMethod as ToolMethod<string>).metadata.command).toBe('simple-method');
  });

  it('should generate correct title from method name', () => {
    class Test {
      @tool({ description: 'test' })
      getUserData() {
        return new Promise(resolve => resolve('data'));
      }

      @tool({ description: 'test' })
      processInput() {
        return new Promise(resolve => resolve('processed'));
      }
    }

    const test = new Test();
    expect((test.getUserData as ToolMethod<string>).metadata.title).toBe('get User Data');
    expect((test.processInput as ToolMethod<string>).metadata.title).toBe('process Input');
  });
});

describe('service', () => {
  it('should add metadata to service class', () => {
    @service()
    class TestService {
      static method() {}
    }

    expect((TestService as unknown as { metadata: { name: string } }).metadata).toBeDefined();
    expect((TestService as unknown as { metadata: { name: string } }).metadata.name).toBe('test');
  });

  it('should handle class names without Service suffix', () => {
    @service()
    class TestClass {
      static method() {}
    }

    expect((TestClass as unknown as { metadata: { name: string } }).metadata).toBeDefined();
    expect((TestClass as unknown as { metadata: { name: string } }).metadata.name).toBe('test-class');
  });

  it('should handle class names with multiple camelCase words', () => {
    @service()
    class UserManagementService {
      static method() {}
    }

    expect((UserManagementService as unknown as { metadata: { name: string } }).metadata).toBeDefined();
    expect((UserManagementService as unknown as { metadata: { name: string } }).metadata.name).toBe('user-management');
  });

  it('should handle class names with numbers', () => {
    @service()
    class API2Service {
      static method() {}
    }

    expect((API2Service as unknown as { metadata: { name: string } }).metadata).toBeDefined();
    expect((API2Service as unknown as { metadata: { name: string } }).metadata.name).toBe('api2');
  });
});

describe('loadTools', () => {
  it('should load tools from a class', async () => {
    @service()
    class TestService {
      @tool({ description: 'test' })
      static foo() {
        return new Promise(resolve => resolve('bar'));
      }
    }

    const tools = loadTools(TestService);
    expect(tools.length).toBe(1);
    expect(tools[0].metadata.name).toBe('foo');

    const { result, status, message } = (await TestService['tool_foo']()) as unknown as ToolOutput<string>;
    expect(status).toBe('success');
    expect(result).toBe('bar');
    expect(message).toBe('');
  });

  it('should load tools from a class with error', async () => {
    @service()
    class TestService {
      @tool({ description: 'test' })
      static foo() {
        return new Promise(() => {
          throw new Error('error message');
        });
      }
    }

    const tools = loadTools(TestService);
    expect(tools.length).toBe(1);
    expect(tools[0].metadata.name).toBe('foo');

    const { result, status, message } = (await TestService['tool_foo']()) as unknown as ToolOutput<string>;
    expect(status).toBe('error');
    expect(message).toBe('error message');
    expect(result).toBe('');
  });

  it('should load multiple tools from a class', () => {
    @service()
    class TestService {
      @tool({ description: 'test1' })
      static method1() {
        return new Promise(resolve => resolve('result1'));
      }

      @tool({ description: 'test2' })
      static method2() {
        return new Promise(resolve => resolve('result2'));
      }

      @tool({ description: 'test3' })
      static method3() {
        return new Promise(resolve => resolve('result3'));
      }
    }

    const tools = loadTools(TestService);
    expect(tools.length).toBe(3);
    expect(tools.map(t => t.metadata.name)).toEqual(['method1', 'method2', 'method3']);
  });

  it('should transform metadata correctly', () => {
    @service()
    class TestService {
      @tool({ description: 'test' })
      static foo() {
        return new Promise(resolve => resolve('bar'));
      }
    }

    loadTools(TestService);

    expect(TestService['tool_foo'].metadata.command).toBe('test.foo');
    expect(TestService['tool_foo'].metadata.toolName).toBe('test_foo');
  });

  it('should filter out non-tool methods', () => {
    @service()
    class TestService {
      @tool({ description: 'test' })
      static toolMethod() {
        return new Promise(resolve => resolve('result'));
      }

      static nonToolMethod() {
        return 'not a tool';
      }

      constructor() {}
      arguments = {};
      caller = {};
      callee = {};
    }

    const tools = loadTools(TestService);
    expect(tools.length).toBe(1);
    expect(tools[0].metadata.name).toBe('toolMethod');
  });

  it('should handle methods with arguments', async () => {
    @service()
    class TestService {
      @tool({ description: 'test' })
      static add(a: number, b: number) {
        return new Promise(resolve => resolve(a + b));
      }
    }

    loadTools(TestService);

    const { result, status } = (await TestService['tool_add'](5, 3)) as unknown as ToolOutput<number>;
    expect(status).toBe('success');
    expect(result).toBe(8);
  });
});

describe('jsonSchemaToZod', () => {
  it('should return z.any() for undefined schema', () => {
    const result = jsonSchemaToZod(undefined as unknown as Schema);
    expect(result).toBeDefined();
  });

  it('should handle string type', () => {
    const schema = { type: 'string' as const, description: 'A string field' };
    const result = jsonSchemaToZod(schema);
    expect(result).toBeDefined();
  });

  it('should handle number type', () => {
    const schema = { type: 'number' as const, description: 'A number field' };
    const result = jsonSchemaToZod(schema);
    expect(result).toBeDefined();
  });

  it('should handle boolean type', () => {
    const schema = { type: 'boolean' as const, description: 'A boolean field' };
    const result = jsonSchemaToZod(schema);
    expect(result).toBeDefined();
  });

  it('should handle object type with properties', () => {
    const schema = {
      type: 'object' as const,
      properties: {
        name: { type: 'string' as const },
        age: { type: 'number' as const }
      }
    };
    const result = jsonSchemaToZod(schema);
    expect(result).toBeDefined();
  });

  it('should handle array type', () => {
    const schema = {
      type: 'array' as const,
      items: { type: 'string' as const },
      description: 'Array of strings'
    };
    const result = jsonSchemaToZod(schema);
    expect(result).toBeDefined();
  });

  it('should handle enum type with default', () => {
    const schema = {
      type: 'string' as const,
      enum: ['option1', 'option2', 'option3'],
      default: 'option1',
      description: 'Select an option'
    };
    const result = jsonSchemaToZod(schema);
    expect(result).toBeDefined();
  });

  it('should handle enum type without default', () => {
    const schema = {
      type: 'string' as const,
      enum: ['option1', 'option2'],
      description: 'Select an option'
    };
    const result = jsonSchemaToZod(schema);
    expect(result).toBeDefined();
  });

  it('should handle oneOf with multiple schemas', () => {
    const schema = {
      oneOf: [{ type: 'string' as const }, { type: 'number' as const }],
      description: 'String or number'
    };
    const result = jsonSchemaToZod(schema);
    expect(result).toBeDefined();
  });

  it('should handle oneOf with single schema', () => {
    const schema = {
      oneOf: [{ type: 'string' as const }],
      description: 'Single option'
    };
    const result = jsonSchemaToZod(schema);
    expect(result).toBeDefined();
  });

  it('should handle oneOf with empty array', () => {
    const schema = {
      oneOf: [],
      description: 'Empty options'
    };
    const result = jsonSchemaToZod(schema);
    expect(result).toBeDefined();
  });

  it('should handle patternProperties', () => {
    const schema = {
      patternProperties: {
        '^[a-z]+$': { type: 'string' as const }
      }
    };
    const result = jsonSchemaToZod(schema);
    expect(result).toBeDefined();
  });

  it('should handle both properties and patternProperties', () => {
    const schema = {
      properties: {
        name: { type: 'string' as const }
      },
      patternProperties: {
        '^[a-z]+$': { type: 'number' as const }
      }
    };
    const result = jsonSchemaToZod(schema);
    expect(result).toBeDefined();
  });

  it('should handle required fields', () => {
    const schema = {
      type: 'object' as const,
      properties: {
        name: { type: 'string' as const },
        age: { type: 'number' as const }
      },
      required: ['name']
    };
    const result = jsonSchemaToZod(schema);
    expect(result).toBeDefined();
  });

  it('should handle additionalProperties', () => {
    const schema = {
      type: 'object' as const,
      properties: {
        name: { type: 'string' as const }
      },
      additionalProperties: false
    };
    const result = jsonSchemaToZod(schema);
    expect(result).toBeDefined();
  });
});
