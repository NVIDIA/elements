import { z } from 'zod';
export interface ToolAnnotations {
  readOnlyHint?: boolean; //  If true, the tool does not change its environment
  destructiveHint?: boolean; // If true, the tool may perform destructive/irreversible updates
  idempotentHint?: boolean; // If true, repeated calls with same args have no extra effect
  openWorldHint?: boolean; // If true, tool interacts with external entities
}

export const ToolSupport = {
  None: 0,
  MCP: 1 << 0,
  CLI: 1 << 1,
  All: (1 << 0) | (1 << 1)
} as const;

export type ToolSupportFlags = number;

export interface ToolMetadata {
  inputSchema?: Schema;
  outputSchema?: Schema;
  summary: string;
  description?: string;
  annotations?: ToolAnnotations;
  name: string;
  title: string;
  command: string;
  toolName: string;
  support: ToolSupportFlags;
}

export interface Schema {
  type?: 'string' | 'number' | 'boolean' | 'object' | 'array';
  description?: string;
  default?: string | number | boolean | object;
  defaultTemplate?: string; // non-standard schema property for default template
  enum?: string[];
  enumNames?: string[];
  minItems?: number;
  maxItems?: number;
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
  service?: boolean; // set to true if the tool runs a long-running process
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
  status: 'complete' | 'error';
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
  summary,
  description,
  annotations,
  inputSchema,
  outputSchema,
  support
}: {
  summary: string;
  description?: string;
  annotations?: ToolAnnotations;
  inputSchema?: Schema;
  outputSchema?: Schema;
  support?: ToolSupportFlags;
}) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return function (originalMethod: ToolMethod<any>, _context: ClassMethodDecoratorContext) {
    const command = originalMethod.name
      .replaceAll(/([a-z0-9])([A-Z])/g, '$1.$2')
      .toLowerCase()
      .replace('get.', '');

    const metadata = {
      support: support ?? ToolSupport.All,
      summary,
      description,
      annotations,
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
          return { status: 'complete', message: '', result: await obj[name](...args) };
        } catch (e) {
          return { status: 'error', message: (e as Error).message };
        }
      };
      obj[toolName].metadata = obj[name].metadata;
      obj[toolName].metadata.command = `${obj.metadata.name}.${obj[name].metadata.command}`;
      obj[toolName].metadata.toolName = `${obj[toolName].metadata.command}`.replaceAll('.', '_').replaceAll('-', '_');
    });
  return Array.from(methods).map(m => obj[`tool_${m as string}`]);
}

export function jsonSchemaToZod(schema: Schema): z.ZodTypeAny {
  if (!schema) {
    return z.any();
  }

  const requiredFields = schema?.required || [];

  const propertiesSchema = schema?.properties
    ? Object.fromEntries(
        Object.entries(schema.properties).map(([propertyName, propertySchema]) => {
          let zodSchema = jsonSchemaToZod(propertySchema);

          if (!requiredFields.includes(propertyName)) {
            zodSchema = zodSchema.optional();
          }

          if (propertySchema.default !== undefined) {
            zodSchema = zodSchema.default(propertySchema.default);
          }

          if (propertySchema.defaultTemplate !== undefined) {
            zodSchema = zodSchema.default(propertySchema.defaultTemplate);
          }

          return [propertyName, zodSchema];
        })
      )
    : {};

  const patternPropertiesSchema: Record<string, z.ZodTypeAny> = schema?.patternProperties
    ? Object.fromEntries(
        Object.entries(schema.patternProperties).map(([pattern, value]) => [pattern, jsonSchemaToZod(value)])
      )
    : {};

  if (Object.keys(propertiesSchema).length > 0 && Object.keys(patternPropertiesSchema).length > 0) {
    const baseSchema = z.object(propertiesSchema);
    const patternValues = Object.values(patternPropertiesSchema);
    const patternValueSchema = patternValues.length > 0 ? patternValues[0]! : z.any();
    const patternSchema = z.record(z.string(), patternValueSchema);
    return z.intersection(baseSchema, patternSchema);
  }

  if (Object.keys(propertiesSchema).length > 0) {
    return z.object(propertiesSchema);
  }

  if (Object.keys(patternPropertiesSchema).length > 0) {
    const patternValues = Object.values(patternPropertiesSchema);
    const patternValueSchema = patternValues.length > 0 ? patternValues[0]! : z.any();
    return z.record(z.string(), patternValueSchema);
  }

  if (schema.type === 'array') {
    let arraySchema = z.array(jsonSchemaToZod(schema.items!));

    if (typeof schema.minItems === 'number' && schema.minItems > 0) {
      arraySchema = arraySchema.min(schema.minItems);
    }

    if (typeof schema.maxItems === 'number' && schema.maxItems >= 0) {
      arraySchema = arraySchema.max(schema.maxItems);
    }

    return arraySchema.describe(schema.description ?? '');
  }

  if (schema.oneOf && Array.isArray(schema.oneOf)) {
    const unionSchemas = schema.oneOf.map(item => jsonSchemaToZod(item));
    if (unionSchemas.length === 0) {
      return z.any().describe(schema.description ?? '');
    }
    if (unionSchemas.length === 1) {
      return unionSchemas[0]!.describe(schema.description ?? '');
    }
    return z.union(unionSchemas as [z.ZodTypeAny, z.ZodTypeAny, ...z.ZodTypeAny[]]).describe(schema.description ?? '');
  }

  if (schema.type === 'string' && schema.enum) {
    const enumSchema = z.enum(schema.enum as [string, ...string[]]).describe(schema.description ?? '');
    if (typeof schema.default === 'string') {
      return enumSchema.default(schema.default);
    }
    return enumSchema;
  }

  if (schema.type === 'object' && schema.additionalProperties === true) {
    return z.record(z.string(), z.any()).describe(schema.description ?? '');
  }

  return (z[schema.type as keyof typeof z] as () => z.ZodTypeAny)().describe(schema.description ?? '');
}
