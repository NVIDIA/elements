import { select, input, confirm, editor } from '@inquirer/prompts';
import { type ManagedToolMethod } from '@internals/tools';
import ora, { type Ora } from 'ora';
import { marked } from 'marked';
import { markedTerminal } from 'marked-terminal';

export const banner = `"░██████████ ░██                                                     ░██               \\n░██         ░██                                                     ░██               \\n░██         ░██  ░███████  ░█████████████   ░███████  ░████████  ░████████  ░███████  \\n░█████████  ░██ ░██    ░██ ░██   ░██   ░██ ░██    ░██ ░██    ░██    ░██    ░██        \\n░██         ░██ ░█████████ ░██   ░██   ░██ ░█████████ ░██    ░██    ░██     ░███████  \\n░██         ░██ ░██        ░██   ░██   ░██ ░██        ░██    ░██    ░██           ░██ \\n░██████████ ░██  ░███████  ░██   ░██   ░██  ░███████  ░██    ░██     ░████  ░███████"`;

export type ArgInputType = 'string' | 'number' | 'boolean' | 'object' | 'array';

export const colors = {
  info: value => `\x1b[34m${value}\x1b[0m`,
  error: value => `\x1b[31m${value}\x1b[0m`,
  warning: value => `\x1b[33m${value}\x1b[0m`,
  complete: value => `\x1b[32m${value}\x1b[0m`
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
  let spinner: Ora;

  const startTime = Date.now();
  if (isInteractive) {
    spinner = ora({ spinner: 'star', color: 'green', text: getSpinnerProgressMessage() });
    spinner.start();
  }

  const value = await fn(args);

  if (isInteractive) {
    await new Promise(resolve => setTimeout(resolve, 1000 - (Date.now() - startTime)));
    spinner?.stop();
  }
  return value;
}

export async function getArgValue(argName: string, propertySchema): Promise<string | boolean> {
  if (propertySchema.type === 'string' && propertySchema.enum) {
    return getSelect(argName, propertySchema);
  } else if (propertySchema.type === 'boolean') {
    return getBoolean(argName, propertySchema);
  } else if (propertySchema.type === 'string' && propertySchema.defaultTemplate) {
    return getEditor(argName, propertySchema);
  } else {
    return getInput(argName);
  }
}

export function getEditor(value: string, prop: { defaultTemplate?: string; defaultTemplatePostfix?: string }) {
  return editor({
    message: `Enter ${value}.`,
    postfix: prop.defaultTemplatePostfix,
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

export function isObject(value: unknown) {
  return (
    typeof value === 'object' && // Check if it's an object (includes null, arrays)
    value !== null && // Exclude null
    !Array.isArray(value) && // Exclude arrays
    Object.prototype.toString.call(value) === '[object Object]' // Ensure it's a plain object
  );
}

interface Report {
  [key: string]: {
    message: string;
    status: 'success' | 'danger' | 'info' | 'log' | 'warning';
  };
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
  return (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    isObject(result) && Object.entries(result).every(([_, value]: [string, any]) => value?.status && value?.message)
  );
}

export function reportHasFailures(result: Report) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return Object.entries(result).some(([_, value]: [string, any]) => value?.status === 'danger');
}

export function renderReport(result: Report) {
  const report = Object.entries(result)
    .map(([key, value]) => {
      const label = key
        .replace(/([A-Z])/g, ' $1')
        .trim()
        .toLowerCase();
      return `${statusIcons[value.status]} (${label}): ${value.message}`;
    })
    .join('\n');

  console.log(report);

  if (reportHasFailures(result)) {
    process.exit(1);
  }
}

export function isStringArray(result: unknown) {
  return Array.isArray(result) && result.every(item => typeof item === 'string');
}

export function isObjectLiteral(item) {
  if (!item || typeof item !== 'object' || Array.isArray(item)) {
    return false;
  }
  const proto = Object.getPrototypeOf(item);
  return proto === null || proto === Object.prototype;
}

export async function renderResult(result: unknown) {
  if (isReport(result)) {
    renderReport(result as unknown as Report);
  } else if (Array.isArray(result) || isObjectLiteral(result)) {
    console.log(JSON.stringify(result, null, 2));
  } else if (typeof result === 'string' && result.trim().startsWith('http') && !result.includes('\n')) {
    console.log(colors.complete(result.match(/.{1,80}/g).join('\n')));
  } else if (typeof result === 'string') {
    marked.use(markedTerminal());
    console.log(await marked.parse(result));
  } else {
    console.log(result);
  }
}
