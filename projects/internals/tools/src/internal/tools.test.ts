// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it } from 'vitest';
import { loadTools, service, tool, jsonSchemaToZod, ToolSupport } from './tools.js';
import type { ToolMethod, ToolOutput, Schema } from './tools.js';

describe('metadata', () => {
  it('should be defined', () => {
    expect(tool).toBeDefined();
  });

  it('should add metadata to the method', () => {
    class Test {
      @tool({ summary: 'test' })
      method() {
        return new Promise(resolve => resolve('test'));
      }
    }

    const test = new Test();
    expect((test.method as ToolMethod<string>).metadata).toBeDefined();
    expect((test.method as ToolMethod<string>).metadata.summary).toBe('test');
    expect((test.method as ToolMethod<string>).metadata.name).toBe('method');
    expect((test.method as ToolMethod<string>).metadata.command).toBe('method');
  });

  it('should add metadata with inputSchema and outputSchema', () => {
    const inputSchema = { type: 'string' as const, description: 'input' };
    const outputSchema = { type: 'number' as const, description: 'output' };

    class Test {
      @tool({ summary: 'test', inputSchema, outputSchema })
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
      @tool({ summary: 'test' })
      getData() {
        return new Promise(resolve => resolve('data'));
      }

      @tool({ summary: 'test' })
      processUserInput() {
        return new Promise(resolve => resolve('processed'));
      }

      @tool({ summary: 'test' })
      simpleMethod() {
        return new Promise(resolve => resolve('simple'));
      }
    }

    const test = new Test();
    expect((test.getData as ToolMethod<string>).metadata.command).toBe('data');
    expect((test.processUserInput as ToolMethod<string>).metadata.command).toBe('process.user.input');
    expect((test.simpleMethod as ToolMethod<string>).metadata.command).toBe('simple.method');
  });

  it('should use explicit support flag when provided', () => {
    class Test {
      @tool({ summary: 'test', support: ToolSupport.MCP })
      method() {
        return new Promise(resolve => resolve('test'));
      }
    }

    const test = new Test();
    expect((test.method as ToolMethod<string>).metadata.support).toBe(ToolSupport.MCP);
  });

  it('should generate correct title from method name', () => {
    class Test {
      @tool({ summary: 'test' })
      getUserData() {
        return new Promise(resolve => resolve('data'));
      }

      @tool({ summary: 'test' })
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
      @tool({ summary: 'test' })
      static foo() {
        return new Promise(resolve => resolve('bar'));
      }
    }

    const tools = loadTools(TestService);
    expect(tools.length).toBe(1);
    expect(tools[0].metadata.name).toBe('foo');

    const { result, status, message } = (await TestService['tool_foo']()) as unknown as ToolOutput<string>;
    expect(status).toBe('complete');
    expect(result).toBe('bar');
    expect(message).toBe('');
  });

  it('should load tools from a class with error', async () => {
    @service()
    class TestService {
      @tool({ summary: 'test' })
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
    expect(result).toBe(undefined);
  });

  it('should load multiple tools from a class', () => {
    @service()
    class TestService {
      @tool({ summary: 'test1' })
      static method1() {
        return new Promise(resolve => resolve('result1'));
      }

      @tool({ summary: 'test2' })
      static method2() {
        return new Promise(resolve => resolve('result2'));
      }

      @tool({ summary: 'test3' })
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
      @tool({ summary: 'test' })
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
      @tool({ summary: 'test' })
      static toolMethod() {
        return new Promise(resolve => resolve('result'));
      }

      static nonToolMethod() {
        return 'not a tool';
      }

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
      @tool({ summary: 'test' })
      static add(a: number, b: number) {
        return new Promise(resolve => resolve(a + b));
      }
    }

    loadTools(TestService);

    const { result, status } = (await TestService['tool_add'](5, 3)) as unknown as ToolOutput<number>;
    expect(status).toBe('complete');
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

    // Test that arrays work correctly
    const validData = ['item1', 'item2'];
    const validResult = result.safeParse(validData);
    expect(validResult.success).toBe(true);

    // Test that empty arrays are allowed by default
    const emptyData: string[] = [];
    const emptyResult = result.safeParse(emptyData);
    expect(emptyResult.success).toBe(true);
  });

  it('should handle array type with minItems', () => {
    const schema = {
      type: 'array' as const,
      items: { type: 'string' as const },
      minItems: 2,
      description: 'Array of at least 2 strings'
    };
    const result = jsonSchemaToZod(schema);
    expect(result).toBeDefined();

    // Test that arrays with sufficient items pass validation
    const validData = ['item1', 'item2'];
    const validResult = result.safeParse(validData);
    expect(validResult.success).toBe(true);

    // Test that arrays with more than minimum items pass validation
    const validDataMore = ['item1', 'item2', 'item3'];
    const validResultMore = result.safeParse(validDataMore);
    expect(validResultMore.success).toBe(true);

    // Test that arrays with fewer than minItems fail validation
    const invalidData = ['item1'];
    const invalidResult = result.safeParse(invalidData);
    expect(invalidResult.success).toBe(false);

    // Test that empty arrays fail validation when minItems > 0
    const emptyData: string[] = [];
    const emptyResult = result.safeParse(emptyData);
    expect(emptyResult.success).toBe(false);
  });

  it('should handle array type with minItems of 0', () => {
    const schema = {
      type: 'array' as const,
      items: { type: 'number' as const },
      minItems: 0,
      description: 'Array with minItems 0'
    };
    const result = jsonSchemaToZod(schema);
    expect(result).toBeDefined();

    // Test that empty arrays are allowed when minItems is 0
    const emptyData: number[] = [];
    const emptyResult = result.safeParse(emptyData);
    expect(emptyResult.success).toBe(true);

    // Test that arrays with items are also allowed
    const validData = [1, 2, 3];
    const validResult = result.safeParse(validData);
    expect(validResult.success).toBe(true);
  });

  it('should handle array type without minItems specified', () => {
    const schema = {
      type: 'array' as const,
      items: { type: 'boolean' as const },
      description: 'Array without minItems'
    };
    const result = jsonSchemaToZod(schema);
    expect(result).toBeDefined();

    // Test that empty arrays are allowed when minItems is not specified
    const emptyData: boolean[] = [];
    const emptyResult = result.safeParse(emptyData);
    expect(emptyResult.success).toBe(true);

    // Test that arrays with items are also allowed
    const validData = [true, false, true];
    const validResult = result.safeParse(validData);
    expect(validResult.success).toBe(true);
  });

  it('should handle array type with maxItems', () => {
    const schema = {
      type: 'array' as const,
      items: { type: 'string' as const },
      maxItems: 3,
      description: 'Array of at most 3 strings'
    };
    const result = jsonSchemaToZod(schema);
    expect(result).toBeDefined();

    // Test that empty arrays pass validation
    const emptyData: string[] = [];
    const emptyResult = result.safeParse(emptyData);
    expect(emptyResult.success).toBe(true);

    // Test that arrays with items within limit pass validation
    const validData = ['item1', 'item2'];
    const validResult = result.safeParse(validData);
    expect(validResult.success).toBe(true);

    // Test that arrays at the maximum limit pass validation
    const maxData = ['item1', 'item2', 'item3'];
    const maxResult = result.safeParse(maxData);
    expect(maxResult.success).toBe(true);

    // Test that arrays exceeding maxItems fail validation
    const invalidData = ['item1', 'item2', 'item3', 'item4'];
    const invalidResult = result.safeParse(invalidData);
    expect(invalidResult.success).toBe(false);
  });

  it('should handle array type with maxItems of 0', () => {
    const schema = {
      type: 'array' as const,
      items: { type: 'number' as const },
      maxItems: 0,
      description: 'Array with maxItems 0 (empty arrays only)'
    };
    const result = jsonSchemaToZod(schema);
    expect(result).toBeDefined();

    // Test that empty arrays are allowed when maxItems is 0
    const emptyData: number[] = [];
    const emptyResult = result.safeParse(emptyData);
    expect(emptyResult.success).toBe(true);

    // Test that arrays with any items fail validation when maxItems is 0
    const invalidData = [1];
    const invalidResult = result.safeParse(invalidData);
    expect(invalidResult.success).toBe(false);
  });

  it('should handle array type with both minItems and maxItems', () => {
    const schema = {
      type: 'array' as const,
      items: { type: 'string' as const },
      minItems: 2,
      maxItems: 4,
      description: 'Array with 2-4 strings'
    };
    const result = jsonSchemaToZod(schema);
    expect(result).toBeDefined();

    // Test that arrays within the range pass validation
    const validData1 = ['item1', 'item2'];
    const validResult1 = result.safeParse(validData1);
    expect(validResult1.success).toBe(true);

    const validData2 = ['item1', 'item2', 'item3'];
    const validResult2 = result.safeParse(validData2);
    expect(validResult2.success).toBe(true);

    const validData3 = ['item1', 'item2', 'item3', 'item4'];
    const validResult3 = result.safeParse(validData3);
    expect(validResult3.success).toBe(true);

    // Test that arrays below minItems fail validation
    const invalidDataMin = ['item1'];
    const invalidResultMin = result.safeParse(invalidDataMin);
    expect(invalidResultMin.success).toBe(false);

    // Test that arrays above maxItems fail validation
    const invalidDataMax = ['item1', 'item2', 'item3', 'item4', 'item5'];
    const invalidResultMax = result.safeParse(invalidDataMax);
    expect(invalidResultMax.success).toBe(false);

    // Test that empty arrays fail validation when minItems > 0
    const emptyData: string[] = [];
    const emptyResult = result.safeParse(emptyData);
    expect(emptyResult.success).toBe(false);
  });

  it('should handle array type without maxItems specified', () => {
    const schema = {
      type: 'array' as const,
      items: { type: 'number' as const },
      description: 'Array without maxItems'
    };
    const result = jsonSchemaToZod(schema);
    expect(result).toBeDefined();

    // Test that arrays of any size are allowed when maxItems is not specified
    const smallData = [1];
    const smallResult = result.safeParse(smallData);
    expect(smallResult.success).toBe(true);

    const largeData = Array.from({ length: 1000 }, (_, i) => i);
    const largeResult = result.safeParse(largeData);
    expect(largeResult.success).toBe(true);
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

  it('should handle required fields correctly', () => {
    const schema = {
      type: 'object' as const,
      properties: {
        name: { type: 'string' as const },
        age: { type: 'number' as const },
        email: { type: 'string' as const }
      },
      required: ['name', 'email']
    };
    const result = jsonSchemaToZod(schema);
    expect(result).toBeDefined();

    // Test that required fields are enforced
    const validData = { name: 'John', email: 'john@example.com' };
    const validResult = result.safeParse(validData);
    expect(validResult.success).toBe(true);

    // Test that optional fields can be omitted
    const validDataWithOptional = { name: 'John', email: 'john@example.com', age: 30 };
    const validResultWithOptional = result.safeParse(validDataWithOptional);
    expect(validResultWithOptional.success).toBe(true);

    // Test that missing required fields cause validation to fail
    const invalidData = { age: 30 };
    const invalidResult = result.safeParse(invalidData);
    expect(invalidResult.success).toBe(false);

    // Test that missing one required field causes validation to fail
    const partiallyInvalidData = { name: 'John' };
    const partiallyInvalidResult = result.safeParse(partiallyInvalidData);
    expect(partiallyInvalidResult.success).toBe(false);
  });

  it('should handle objects with no required fields', () => {
    const schema = {
      type: 'object' as const,
      properties: {
        name: { type: 'string' as const },
        age: { type: 'number' as const }
      }
      // no required array - all fields should be optional
    };
    const result = jsonSchemaToZod(schema);
    expect(result).toBeDefined();

    // Test that empty object is valid when no fields are required
    const emptyData = {};
    const emptyResult = result.safeParse(emptyData);
    expect(emptyResult.success).toBe(true);

    // Test that partial data is valid
    const partialData = { name: 'John' };
    const partialResult = result.safeParse(partialData);
    expect(partialResult.success).toBe(true);

    // Test that full data is valid
    const fullData = { name: 'John', age: 30 };
    const fullResult = result.safeParse(fullData);
    expect(fullResult.success).toBe(true);
  });

  it('should handle objects with all fields required', () => {
    const schema = {
      type: 'object' as const,
      properties: {
        name: { type: 'string' as const },
        age: { type: 'number' as const }
      },
      required: ['name', 'age']
    };
    const result = jsonSchemaToZod(schema);
    expect(result).toBeDefined();

    // Test that all required fields must be present
    const validData = { name: 'John', age: 30 };
    const validResult = result.safeParse(validData);
    expect(validResult.success).toBe(true);

    // Test that missing any required field causes validation to fail
    const invalidData1 = { name: 'John' };
    const invalidResult1 = result.safeParse(invalidData1);
    expect(invalidResult1.success).toBe(false);

    const invalidData2 = { age: 30 };
    const invalidResult2 = result.safeParse(invalidData2);
    expect(invalidResult2.success).toBe(false);

    const invalidData3 = {};
    const invalidResult3 = result.safeParse(invalidData3);
    expect(invalidResult3.success).toBe(false);
  });

  it('should handle additionalProperties false', () => {
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

  it('should handle object type with additionalProperties true', () => {
    const schema = {
      type: 'object' as const,
      additionalProperties: true,
      description: 'An object allowing any properties'
    };
    const result = jsonSchemaToZod(schema);
    expect(result).toBeDefined();

    // Test that objects with any properties pass validation
    const validData = { name: 'John', age: 30, nested: { foo: 'bar' } };
    const validResult = result.safeParse(validData);
    expect(validResult.success).toBe(true);

    // Test that empty objects pass validation
    const emptyData = {};
    const emptyResult = result.safeParse(emptyData);
    expect(emptyResult.success).toBe(true);

    // Test that objects with dynamic keys pass validation
    const dynamicData = { key1: 'value1', key2: 123, key3: true, key4: null };
    const dynamicResult = result.safeParse(dynamicData);
    expect(dynamicResult.success).toBe(true);
  });

  it('should handle object type with additionalProperties true in oneOf', () => {
    const schema = {
      oneOf: [{ type: 'string' as const }, { type: 'object' as const, additionalProperties: true }],
      description: 'String or any object'
    };
    const result = jsonSchemaToZod(schema);
    expect(result).toBeDefined();

    const stringData = 'hello';
    const stringResult = result.safeParse(stringData);
    expect(stringResult.success).toBe(true);

    // Test that objects with any properties pass validation
    const objectData = { name: 'test', count: 42, nested: { deep: true } };
    const objectResult = result.safeParse(objectData);
    expect(objectResult.success).toBe(true);

    // Test that empty objects pass validation
    const emptyObjectData = {};
    const emptyObjectResult = result.safeParse(emptyObjectData);
    expect(emptyObjectResult.success).toBe(true);
  });

  it('should handle array type without description', () => {
    const schema = {
      type: 'array' as const,
      items: { type: 'string' as const }
    };
    const result = jsonSchemaToZod(schema);
    expect(result).toBeDefined();
    expect(result.safeParse(['a']).success).toBe(true);
  });

  it('should handle oneOf without description', () => {
    const schema = {
      oneOf: [{ type: 'string' as const }, { type: 'number' as const }]
    };
    const result = jsonSchemaToZod(schema);
    expect(result).toBeDefined();
    expect(result.safeParse('hello').success).toBe(true);
  });

  it('should handle single oneOf without description', () => {
    const schema = {
      oneOf: [{ type: 'string' as const }]
    };
    const result = jsonSchemaToZod(schema);
    expect(result).toBeDefined();
    expect(result.safeParse('hello').success).toBe(true);
  });

  it('should handle empty oneOf without description', () => {
    const schema = {
      oneOf: [] as Schema[]
    };
    const result = jsonSchemaToZod(schema);
    expect(result).toBeDefined();
  });

  it('should handle enum type without description', () => {
    const schema = {
      type: 'string' as const,
      enum: ['a', 'b']
    };
    const result = jsonSchemaToZod(schema);
    expect(result).toBeDefined();
    expect(result.safeParse('a').success).toBe(true);
  });

  it('should handle bare object type without additionalProperties (default behavior)', () => {
    const schema = {
      type: 'object' as const,
      description: 'A bare object'
    };
    const result = jsonSchemaToZod(schema);
    expect(result).toBeDefined();

    const emptyData = {};
    const emptyResult = result.safeParse(emptyData);
    expect(emptyResult.success).toBe(true);
  });
});
