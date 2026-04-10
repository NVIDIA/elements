// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { select, input, confirm, editor } from '@inquirer/prompts';
import { type ManagedToolMethod, type Report } from '@internals/tools';
import ora, { type Ora } from 'ora';
import { marked } from 'marked';
import { markedTerminal } from 'marked-terminal';

export const banner = `"░██████████ ░██                                                     ░██               \\n░██         ░██                                                     ░██               \\n░██         ░██  ░███████  ░█████████████   ░███████  ░████████  ░████████  ░███████  \\n░█████████  ░██ ░██    ░██ ░██   ░██   ░██ ░██    ░██ ░██    ░██    ░██    ░██        \\n░██         ░██ ░█████████ ░██   ░██   ░██ ░█████████ ░██    ░██    ░██     ░███████  \\n░██         ░██ ░██        ░██   ░██   ░██ ░██        ░██    ░██    ░██           ░██ \\n░██████████ ░██  ░███████  ░██   ░██   ░██  ░███████  ░██    ░██     ░████  ░███████"`;

export type ArgInputType = 'string' | 'number' | 'boolean' | 'object' | 'array';

export const colors = {
  info: (value: string) => `\x1b[34m${value}\x1b[0m`,
  error: (value: string) => `\x1b[31m${value}\x1b[0m`,
  warning: (value: string) => `\x1b[33m${value}\x1b[0m`,
  complete: (value: string) => `\x1b[32m${value}\x1b[0m`
};

export function getSpinnerProgressMessage() {
  const messages = [
    'Forging for the perfect elements...',
    'Building the foundation...',
    'Wiring up the design power grid...',
    'Spinning up the AI...',
    'Fine-tuning the UI machinery...',
    'Calibrating the components...',
    'CUDA cores working overtime...',
    'Engineering the heck out of this...',
    'AI-ing the heck out of this...',
    'Launch sequence initiated...',
    'Training neural networks...',
    'Satellite positioning...',
    'Upscaling in progress...',
    'Turning RTX on...',
    'Making the other UI green envy...'
  ];

  return messages[Math.floor(Math.random() * messages.length)];
}

export async function runAsyncTool(args: Record<string, unknown>, fn: ManagedToolMethod<unknown>) {
  const isInteractive = !args.start && !args.log && !process.env.CI;
  let spinner: Ora | undefined;

  const startTime = Date.now();
  const originalConsole = console.log;
  if (isInteractive) {
    spinner = ora({ spinner: 'star', color: 'green', text: getSpinnerProgressMessage() });
    spinner.start();
    await new Promise(resolve => setTimeout(resolve, Math.max(0, 1000 - (Date.now() - startTime))));
    console.log = (...args: unknown[]) => (spinner!.text = `${spinner!.text}\n${args.join(' ')}`);
    args.onProgress ??= (message: string) => {
      if (message) {
        spinner!.text = `${spinner!.text}\n${message}`;
      }
    };
  }

  const value = await fn(args);

  if (isInteractive) {
    spinner?.stop();
    console.log = originalConsole;
  }
  return value;
}

interface PropertySchema {
  type?: ArgInputType;
  enum?: string[];
  description?: string;
  default?: unknown;
  defaultTemplate?: string;
  filename?: string;
}

export async function getArgValue(
  argName: string,
  propertySchema: PropertySchema
): Promise<string | boolean | string[]> {
  if (propertySchema.type === 'array') {
    const value = await getInput(argName);
    return value
      .split(',')
      .map(s => s.trim())
      .filter(Boolean);
  } else if (propertySchema.type === 'string' && propertySchema.enum) {
    return getSelect(argName, propertySchema);
  } else if (propertySchema.type === 'boolean') {
    return getBoolean(argName, propertySchema);
  } else if (propertySchema.type === 'string' && propertySchema.defaultTemplate) {
    return getEditor(argName, propertySchema);
  } else {
    return getInput(argName);
  }
}

export function getEditor(value: string, prop: { defaultTemplate?: string; filename?: string }) {
  return editor({
    message: `Enter ${value}.`,
    postfix: prop.filename ?? '.html',
    default: prop.defaultTemplate
  });
}

export function getSelect(value: string, prop: { enum?: string[] }) {
  return select({
    message: `Select a ${value}:`,
    choices:
      prop.enum?.map(value => ({
        name: value,
        value
      })) ?? []
  });
}

export function getInput(value: string) {
  return input({ message: `Enter ${value}:` });
}

export function getBoolean(value: string, prop: { description?: string }) {
  return confirm({ message: `(${value}) ${prop.description ?? ''}:` });
}

export const statusIcons = {
  success: '✅',
  danger: '❌',
  warning: '⚠️',
  info: '💡',
  log: '🔍',
  undefined: ''
};

export function isReport(result: unknown) {
  if (!isObjectLiteral(result)) return false;
  return Object.entries(result as Record<string, unknown>).every(([, value]) => {
    const entry = value as Record<string, unknown>;
    return entry?.status && entry?.message;
  });
}

export function reportHasFailures(result: Report) {
  return Object.values(result).some(value => value.status === 'danger');
}

export async function renderReport(result: Report) {
  const reports = Object.entries(result).map(([key, value]) => {
    const label = key
      .replace(/([A-Z])/g, ' $1')
      .trim()
      .toLowerCase();
    return `${statusIcons[value.status]} (**${label}**): ${value.message}`;
  });

  const results = await Promise.all(reports.map(report => marked.parse(report)));

  console.log(results.map(r => r.trim()).join('\n'));

  if (reportHasFailures(result)) {
    process.exit(1);
  }
}

export function wrapUrl(url: string, maxWidth = 80): string {
  if (url.length <= maxWidth) return url;
  const segments = url.split('/');
  const lines: string[] = [];
  let line = segments[0] ?? '';
  for (let i = 1; i < segments.length; i++) {
    const next = `/${segments[i]}`;
    if ((line + next).length > maxWidth && line.length > 0) {
      lines.push(line);
      line = next;
    } else {
      line += next;
    }
  }
  if (line) lines.push(line);
  return lines.join('\n');
}

export function isObjectLiteral(item: unknown) {
  if (!item || typeof item !== 'object' || Array.isArray(item)) {
    return false;
  }
  const proto = Object.getPrototypeOf(item);
  return proto === null || proto === Object.prototype;
}

let markedConfigured = false;

function configureMarkedTerminal() {
  if (markedConfigured) return;
  markedConfigured = true;
  const colWidth = Math.floor((process.stdout.columns ?? 80) / 4);
  const nameWidth = Math.max(24, colWidth);
  const valueWidth = Math.max(24, colWidth);
  const descriptionWidth = (process.stdout.columns ?? 80) - nameWidth - valueWidth - 4;
  marked.use(
    markedTerminal({
      reflowText: true,
      tableOptions: {
        wordWrap: true,
        colWidths: [nameWidth, valueWidth, descriptionWidth],
        style: {
          head: ['bold']
        }
      }
    })
  );
}

export async function renderResult(result: unknown) {
  if (isReport(result)) {
    configureMarkedTerminal();
    await renderReport(result as unknown as Report);
  } else if (Array.isArray(result) || isObjectLiteral(result)) {
    console.log(JSON.stringify(result, null, 2));
  } else if (typeof result === 'string' && result.trim().startsWith('http') && !result.includes('\n')) {
    console.log(colors.complete(wrapUrl(result)));
  } else if (typeof result === 'string') {
    configureMarkedTerminal();
    console.log(await marked.parse(result));
  } else {
    console.log(result);
  }
}
