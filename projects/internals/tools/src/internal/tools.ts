import { z } from 'zod';

export interface ToolMetadata {
  inputSchema?: Schema;
  outputSchema?: Schema;
  description: string;
  name: string;
  title: string;
  command: string;
  toolName: string;
}

export interface Schema {
  type?: 'string' | 'number' | 'boolean' | 'object' | 'array';
  description?: string;
  default?: string | number | boolean | object;
  defaultTemplate?: string;
  defaultTemplatePostfix?: string;
  enum?: string[];
  enumNames?: string[];
  oneOf?: Schema[];
  properties?: {
    [key: string]: Schema;
  };
  patternProperties?: {
    [key: string]: Schema;
  };
  additionalProperties?: boolean;
  items?: Schema;
  required?: string[];
  service?: boolean; // if the tool is a long running process, it should be marked as true
}

export type ManagedToolMethod<T> = {
  (...args: any[]): Promise<ToolOutput<T>>; // eslint-disable-line @typescript-eslint/no-explicit-any
  metadata?: ToolMetadata;
};

export type ToolMethod<T> = {
  (...args: any[]): Promise<T>; // eslint-disable-line @typescript-eslint/no-explicit-any
  metadata?: ToolMetadata;
};

export interface ToolOutput<T = unknown> {
  status: 'success' | 'error';
  message?: string;
  result: T;
}

/**
 * This decorator adds runtime metadata to enable service loading and use.
 */
export function service() {
  return function (target: { name: string }, _context: ClassDecoratorContext) {
    const name = target.name
      .replace('Service', '')
      .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
      .toLowerCase();
    Object.assign(target, { metadata: { name } });
  };
}

/**
 * This decorator adds runtime metadata to enable tool loading and use.
 * By providing the inputs and outputs schema, tools at runtime can create
 * APIs dynamically for invoking available services and tools.
 */
export function tool({
  description,
  inputSchema,
  outputSchema
}: {
  description: string;
  inputSchema?: Schema;
  outputSchema?: Schema;
}) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return function (originalMethod: ToolMethod<any>, _context: ClassMethodDecoratorContext) {
    const command = originalMethod.name
      .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
      .toLowerCase()
      .replace('get-', '');

    const metadata = {
      description,
      inputSchema,
      outputSchema,
      name: originalMethod.name,
      title: originalMethod.name.replace(/([A-Z])/g, ' $1').trim(),
      command
    };
    Object.assign(originalMethod, { metadata });
    return originalMethod;
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function loadTools(obj: any): ManagedToolMethod<unknown>[] {
  const methods = new Set();
  Object.getOwnPropertyNames(obj)
    .filter(
      n =>
        n !== 'constructor' &&
        n !== 'arguments' &&
        n !== 'caller' &&
        n !== 'callee' &&
        typeof obj[n] === 'function' &&
        obj[n].metadata
    )
    .forEach(name => {
      const toolName = `tool_${name}`;
      methods.add(name);
      obj[toolName] = async function (...args: unknown[]) {
        try {
          return { status: 'success', message: '', result: await obj[name](...args) };
        } catch (e) {
          return { status: 'error', message: e.message, result: '' };
        }
      };
      obj[toolName].metadata = obj[name].metadata;
      obj[toolName].metadata.command = `${obj.metadata.name}.${obj[name].metadata.command}`;
      obj[toolName].metadata.toolName = `${obj[toolName].metadata.command}`.replaceAll('.', '_').replaceAll('-', '_');
    });
  return Array.from(methods).map((m: string) => obj[`tool_${m}`]);
}

export function jsonSchemaToZod(schema: Schema) {
  if (!schema) {
    return z.any();
  }

  const propertiesSchema = schema?.properties
    ? Object.fromEntries(Object.entries(schema.properties).map(([pattern, value]) => [pattern, jsonSchemaToZod(value)]))
    : {};

  const patternPropertiesSchema = schema?.patternProperties
    ? Object.fromEntries(
        Object.entries(schema.patternProperties).map(([pattern, value]) => [pattern, jsonSchemaToZod(value)])
      )
    : {};

  if (Object.keys(propertiesSchema).length > 0 && Object.keys(patternPropertiesSchema).length > 0) {
    const baseSchema = z.object(propertiesSchema);
    const patternValues = Object.values(patternPropertiesSchema);
    const patternValueSchema = patternValues.length > 0 ? patternValues[0] : z.any();
    const patternSchema = z.record(z.string(), patternValueSchema);
    return z.intersection(baseSchema, patternSchema);
  }

  if (Object.keys(propertiesSchema).length > 0) {
    return z.object(propertiesSchema);
  }

  if (Object.keys(patternPropertiesSchema).length > 0) {
    const patternValues = Object.values(patternPropertiesSchema);
    const patternValueSchema = patternValues.length > 0 ? patternValues[0] : z.any();
    return z.record(z.string(), patternValueSchema);
  }

  if (schema.type === 'array') {
    return z.array(jsonSchemaToZod(schema.items)).describe(schema.description);
  }

  if (schema.oneOf && Array.isArray(schema.oneOf)) {
    const unionSchemas = schema.oneOf.map(item => jsonSchemaToZod(item));
    if (unionSchemas.length === 0) {
      return z.any().describe(schema.description);
    }
    if (unionSchemas.length === 1) {
      return unionSchemas[0].describe(schema.description);
    }
    return z.union(unionSchemas as [z.ZodTypeAny, z.ZodTypeAny, ...z.ZodTypeAny[]]).describe(schema.description);
  }

  if (schema.type === 'string' && schema.enum) {
    const enumSchema = z.enum(schema.enum as [string, ...string[]]).describe(schema.description);
    if (typeof schema.default === 'string') {
      return enumSchema.default(schema.default);
    }
    return enumSchema;
  }

  return z[schema.type as string]().describe(schema.description);
}
