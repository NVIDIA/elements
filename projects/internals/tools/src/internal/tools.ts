import { z } from 'zod';

export interface ToolMetadata {
  inputSchema?: Schema;
  outputSchema?: Schema;
  description: string;
  name: string;
  title: string;
  command: string;
}

export interface Schema {
  type: 'string' | 'number' | 'boolean' | 'object' | 'array';
  description?: string;
  default?: string | number | boolean | object;
  enum?: string[];
  enumNames?: string[];
  properties?: {
    [key: string]: Schema;
  };
  items?: Schema;
  required?: string[];
  service?: boolean; // if the tool is a long running process, it should be marked as true
}

export interface ToolOutput<T = unknown> {
  status: 'success' | 'error';
  message?: string;
  result: T;
}

export interface ToolOutputFormat<T = unknown> {
  status: 'success' | 'error';
  message?: string;
  result: {
    value: T;
    formatted: string;
  };
}

export type ToolMethod<T> = {
  (...args: any[]): Promise<T>; // eslint-disable-line @typescript-eslint/no-explicit-any
  metadata?: ToolMetadata;
};

export function service() {
  return function (target: { name: string }, _context: ClassDecoratorContext) {
    const name = target.name
      .replace('Service', '')
      .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
      .toLowerCase();
    Object.assign(target, { metadata: { name } });
  };
}

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
export function loadTools(obj: any): ToolMethod<unknown>[] {
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
      obj[toolName].metadata.id = `elements_${obj[name].metadata.command}`;
    });
  return Array.from(methods).map((m: string) => obj[`tool_${m}`]);
}

export function jsonSchemaToZod(schema: Schema) {
  return schema.properties
    ? Object.fromEntries(
        Object.entries(schema.properties).map(([key, value]) => {
          if (value.type === 'string' && value.enum) {
            const enumSchema = z.enum(value.enum as [string, ...string[]]).describe(value.description);
            if (typeof value.default === 'string') {
              return [key, enumSchema.default(value.default)];
            }
            return [key, enumSchema];
          }

          if (value.type === 'object') {
            return [
              key,
              z
                .object({
                  [key]: z
                    .object(
                      Object.fromEntries(
                        Object.entries(value.properties).map(([key, value]) => [key, jsonSchemaToZod(value)])
                      )
                    )
                    .describe(value.description)
                })
                .describe(value.description)
            ];
          }

          if (value.type === 'array') {
            return [key, z.array(jsonSchemaToZod(value.items)).describe(value.description)];
          }

          return [key, z[value.type as string]().describe(value.description)];
        })
      )
    : {};
}

export function jsonSchemaToZodMCP(schema: Schema) {
  const newSchema = { ...schema };

  Object.keys(newSchema.properties).forEach(key => {
    if (newSchema.properties[key].service) {
      // remove service properties from the schema
      delete newSchema.properties[key];
    }
  });

  return jsonSchemaToZod(newSchema);
}
