// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { ApiService as MetadataApiService, type Attribute, type Element } from '@internals/metadata';
import { getContextAPIs, getContextTokens, searchContextAPIs, type PartialAPIResult } from './utils.js';
import {
  formatValidationResult,
  readStdin,
  readValidationPaths,
  validate,
  validateVirtualFilename,
  type ValidationLanguage,
  type ValidationResult
} from './validate.js';
import { service, tool, type Schema, type ToolCli } from '../internal/tools.js';
import { getElementImports, markdownDescription } from '../internal/utils.js';

const MAX_RESULT_LIMIT = 3;

const validationCli: ToolCli = {
  exclude: ['template'],
  properties: {
    stdin: { type: 'boolean', default: false, description: 'Read content from standard input.' },
    fix: { type: 'boolean', default: false, description: 'Apply ESLint fixes to path inputs.' }
  },
  optionNames: { maxDiagnostics: 'max-diagnostics' },
  positionals: { paths: { optional: true, variadic: true } },
  async transformInput(args) {
    const { stdin, paths, lang, fix, ...input } = args;
    const pathList = Array.isArray(paths) ? paths.filter((path): path is string => typeof path === 'string') : [];
    if (stdin !== true) return { ...input, paths: pathList, fix: fix === true, format: 'json' };
    if (pathList.length > 0) throw new Error('Use paths or --stdin, not both.');
    const inputLanguage: ValidationLanguage = lang === 'json' ? 'json' : 'html';
    if (fix === true) throw new Error('--fix is available only when checking paths.');
    return { ...input, template: await readStdin(), lang: inputLanguage, format: 'json' };
  },
  formatOutput(result, args) {
    if (!isValidationResult(result)) throw new Error('Validation returned an invalid result.');
    return args.format === 'markdown' ? formatValidationResult(result) : JSON.stringify(result, null, 2);
  },
  exitCode(result) {
    return isValidationResult(result) && !result.ok ? 1 : 0;
  }
};

function isValidationResult(result: unknown): result is ValidationResult {
  return (
    typeof result === 'object' &&
    result !== null &&
    'ok' in result &&
    typeof result.ok === 'boolean' &&
    'summary' in result &&
    'diagnostics' in result
  );
}

const listToolHelpfulTip =
  'Tip: Use the list tool to get a summary list of all available components and attribute APIs.';

const validationResultSchema: Schema = {
  type: 'object',
  properties: {
    ok: { type: 'boolean' },
    summary: {
      type: 'object',
      properties: {
        files: { type: 'number' },
        errors: { type: 'number' },
        warnings: { type: 'number' },
        truncated: { type: 'boolean' }
      },
      required: ['files', 'errors', 'warnings', 'truncated'],
      additionalProperties: false
    },
    diagnostics: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          file: { type: 'string' },
          line: { type: 'number' },
          column: { type: 'number' },
          endLine: { type: 'number' },
          endColumn: { type: 'number' },
          severity: { type: 'string', enum: ['error', 'warning'] },
          rule: { type: 'string' },
          message: { type: 'string' },
          suggestion: { type: 'string' },
          fixable: { type: 'boolean' }
        },
        required: ['file', 'line', 'column', 'endLine', 'endColumn', 'severity', 'rule', 'message', 'fixable'],
        additionalProperties: false
      }
    }
  },
  required: ['ok', 'summary', 'diagnostics'],
  additionalProperties: false
};

@service()
export class ApiService {
  @tool({
    summary: 'Get list of all available Elements (nve-*) APIs and components.',
    inputSchema: {
      type: 'object',
      properties: {
        format: {
          type: 'string',
          description: markdownDescription,
          enum: ['markdown', 'json'],
          default: 'markdown'
        }
      },
      additionalProperties: false
    },
    outputSchema: {
      oneOf: [
        { type: 'string' },
        {
          type: 'object',
          properties: {
            elements: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  name: { type: 'string' },
                  description: { type: 'string' },
                  behavior: { type: 'string' }
                },
                additionalProperties: false,
                required: ['name', 'description', 'behavior']
              }
            },
            attributes: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  name: { type: 'string' },
                  description: { type: 'string' },
                  behavior: { type: 'string' }
                },
                additionalProperties: false,
                required: ['name', 'description', 'behavior']
              }
            }
          }
        }
      ],
      additionalProperties: false
    }
  })
  static async list(
    { format }: { format: 'markdown' | 'json' } = { format: 'markdown' }
  ): Promise<{ elements: PartialAPIResult[]; attributes: PartialAPIResult[] } | string> {
    const apis = await MetadataApiService.getData();
    return getContextAPIs(format, apis);
  }

  @tool({
    summary: `Get documentation known components or attributes by name (nve-*).`,
    description: `Get documentation known components or attributes by name (nve-*). Limit: ${MAX_RESULT_LIMIT}`,
    inputSchema: {
      type: 'object',
      properties: {
        names: {
          type: 'array',
          items: { type: 'string' },
          minItems: 1,
          maxItems: MAX_RESULT_LIMIT,
          description: `1 to ${MAX_RESULT_LIMIT} component or attribute names (e.g., ["nve-button"] or ["nve-button", "nve-text"]).\n\n${listToolHelpfulTip}`
        },
        format: {
          type: 'string',
          description: markdownDescription,
          enum: ['markdown', 'json'],
          default: 'markdown'
        }
      },
      required: ['names'],
      additionalProperties: false
    },
    outputSchema: {
      oneOf: [{ type: 'string' }, { type: 'array', items: { type: 'object', additionalProperties: true } }]
    }
  })
  static async get({
    names,
    format
  }: {
    names: string | string[];
    format: 'markdown' | 'json';
  }): Promise<(Element | Attribute)[] | string> {
    const nameList = Array.isArray(names) ? names : [names];
    const results = await Promise.all(
      nameList.map(async name => {
        const matches = await searchContextAPIs(name, { limit: 1 });
        return matches.find((r: Element | Attribute) => r.name === name) ?? name;
      })
    );

    const found = results
      .filter((r: Element | Attribute | string): r is Element | Attribute => typeof r !== 'string')
      .slice(0, MAX_RESULT_LIMIT);
    const notFound = results.filter((r: Element | Attribute | string): r is string => typeof r === 'string');

    if (found.length === 0) {
      throw new Error(`No components or APIs found matching "${notFound.join('", "')}".\n\n${listToolHelpfulTip}`);
    }

    if (format === 'json') {
      return found.map((r: Element | Attribute) => ({ ...r, markdown: undefined }));
    }

    const markdown = found.map((r: Element | Attribute) => r.markdown).join('\n\n---\n\n');
    const notFoundNote = notFound.length > 0 ? `\n\n---\n\nNot found: ${notFound.join(', ')}` : '';
    return `${markdown}${notFoundNote}`;
  }

  @tool({
    summary: 'Check HTML and JSON files or supplied content with Elements lint rules.',
    description: 'Check supported files or supplied HTML or JSON content with the recommended Elements lint rules.',
    inputSchema: {
      type: 'object',
      properties: {
        paths: {
          type: 'array',
          items: { type: 'string' },
          description: 'HTML or JSON files and glob patterns relative to the current directory.'
        },
        template: {
          type: 'string',
          description: 'HTML or JSON content to check. Defaults to HTML; provide lang=json and filename for JSON.'
        },
        lang: {
          type: 'string',
          enum: ['html', 'json'],
          default: 'html',
          description: 'Content language when checking supplied content.'
        },
        filename: {
          type: 'string',
          description: 'Optional path for supplied content. Required for JSON content.'
        },
        format: {
          type: 'string',
          enum: ['markdown', 'json'],
          default: 'markdown',
          description: markdownDescription
        },
        maxDiagnostics: {
          type: 'number',
          description: 'Maximum number of diagnostics returned. Summary counts remain complete.',
          default: 100
        }
      },
      additionalProperties: false
    },
    outputSchema: {
      oneOf: [
        {
          type: 'string'
        },
        validationResultSchema
      ]
    },
    cli: validationCli
  })
  static async validate({
    paths,
    template,
    lang,
    filename,
    format = 'markdown',
    maxDiagnostics,
    fix = false
  }: {
    paths?: string[];
    template?: string;
    lang?: ValidationLanguage;
    filename?: string;
    format?: 'markdown' | 'json';
    maxDiagnostics?: number;
    fix?: boolean;
  }): Promise<ValidationResult | string> {
    const result = await validateApiRequest({ paths, template, lang, filename, maxDiagnostics, fix });
    return format === 'json' ? result : formatValidationResult(result);
  }

  @tool({
    summary: 'Get esm imports for a given HTML template using Elements APIs (nve-*).',
    inputSchema: {
      type: 'object',
      properties: {
        template: {
          type: 'string'
        }
      },
      required: ['template']
    },
    outputSchema: {
      type: 'array',
      items: { type: 'string' }
    }
  })
  static async importsGet({ template }: { template: string }): Promise<string[]> {
    const elements = await MetadataApiService.getData();
    return getElementImports(template, elements.data.elements);
  }

  @tool({
    app: { resourceUri: 'ui://elements/tokens-list' },
    summary: 'Get available semantic CSS custom properties / design tokens for theming.',
    inputSchema: {
      type: 'object',
      properties: {
        format: {
          type: 'string',
          description: markdownDescription,
          enum: ['markdown', 'json'],
          default: 'markdown'
        },
        query: {
          type: 'string',
          description: 'Optional search query used to filter tokens by name, value, or description before rendering.'
        }
      },
      additionalProperties: false
    },
    outputSchema: {
      oneOf: [
        { type: 'string' },
        {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              name: { type: 'string' },
              value: { type: 'string' },
              description: { type: 'string' }
            },
            additionalProperties: false
          }
        }
      ],
      additionalProperties: false
    }
  })
  static async tokensList(
    { format, query }: { format: 'markdown' | 'json'; query?: string } = { format: 'markdown' }
  ): Promise<{ name: string; value: string; description: string }[] | string> {
    const apis = await MetadataApiService.getData();
    return getContextTokens(format, apis.data.tokens, { query }) ?? '';
  }

  @tool({
    app: { resourceUri: 'ui://elements/icons-list' },
    summary: 'Get list of all available icon names for nve-icon and nve-icon-button.',
    inputSchema: {
      type: 'object',
      properties: {
        format: {
          type: 'string',
          description: markdownDescription,
          enum: ['markdown', 'json'],
          default: 'markdown'
        }
      },
      additionalProperties: false
    },
    outputSchema: {
      oneOf: [{ type: 'string' }, { type: 'array', items: { type: 'string' } }]
    }
  })
  static async iconsList(
    { format }: { format: 'markdown' | 'json' } = { format: 'markdown' }
  ): Promise<string[] | string> {
    const apis = await MetadataApiService.getData();
    const iconElement = apis.data.elements.find(e => e.name === 'nve-icon');
    const values = iconElement?.manifest?.members?.find(m => m.name === 'name')?.type?.values ?? [];
    const iconNames = values
      .map(v => ('value' in v ? (v as { value: string }).value : (v as { name: string }).name))
      .filter(Boolean);

    if (format === 'json') {
      return iconNames;
    }
    return `## Available Icons (${iconNames.length})\n\n${iconNames.map(n => `\`${n}\``).join(', ')}`;
  }

  static async search({
    query,
    format
  }: {
    query: string;
    format: 'markdown' | 'json';
  }): Promise<(Element | Attribute)[] | string> {
    const results = await searchContextAPIs(query, { limit: MAX_RESULT_LIMIT });

    if (results.length === 0) {
      const message = `No components or APIs found matching "${query}".\n\n${listToolHelpfulTip}`;
      return format === 'markdown' ? message : results;
    }

    return format === 'json'
      ? results.map((r: Element | Attribute) => ({ ...r, markdown: undefined }))
      : results.map((r: Element | Attribute) => r.markdown).join('\n\n---\n\n');
  }
}

async function validateApiRequest({
  paths,
  template,
  lang,
  filename,
  maxDiagnostics,
  fix
}: {
  paths?: string[];
  template?: string;
  lang?: ValidationLanguage;
  filename?: string;
  maxDiagnostics?: number;
  fix: boolean;
}): Promise<ValidationResult> {
  const request = { paths, template, lang, filename, fix };
  assertValidationRequest(request);
  const inputs = await getValidationInputs(request);
  return validate(inputs, { maxDiagnostics, fix });
}

type ValidationRequest = {
  paths?: string[];
  template?: string;
  lang?: ValidationLanguage;
  filename?: string;
  fix: boolean;
};

function assertValidationRequest(request: ValidationRequest): void {
  const usesPaths = Boolean(request.paths?.length);
  const usesTemplate = request.template !== undefined;
  if (usesPaths && usesTemplate) throw new Error('Use paths or template, not both.');
  if (!usesPaths && !usesTemplate) throw new Error('Provide paths or template content.');
  if (request.fix && !usesPaths) throw new Error('--fix is available only when checking paths.');
  assertTemplateLanguage(request);
}

function assertTemplateLanguage({ template, lang, filename }: ValidationRequest): void {
  if (template === undefined) return;
  if (lang === 'json' && !filename) throw new Error('filename is required when checking JSON content.');
}

async function getValidationInputs({ paths, template, lang, filename }: ValidationRequest) {
  if (paths?.length) return readValidationPaths(paths);
  const inputLanguage = lang ?? 'html';
  return [
    {
      filename: validateVirtualFilename(filename ?? `stdin.${inputLanguage}`),
      source: template!,
      lang: inputLanguage
    }
  ];
}
