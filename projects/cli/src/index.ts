#!/usr/bin/env node

// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

process.env.ELEMENTS_ENV = 'cli';

/* istanbul ignore file -- @preserve */
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import { performance } from 'perf_hooks';
import { type ManagedToolMethod, tools, ToolSupport, type Schema } from '@internals/tools';
import { installNve } from './install.js';
import {
  banner,
  colors,
  exitWithCompleteToolResult,
  exitWithToolError,
  getArgValue,
  isInteractiveTerminal,
  runAsyncTool
} from './utils.js';
import { notifyIfUpdateAvailable } from './update.js';

export const VERSION = '0.0.0';
export const BUILD_SHA = '__NVE_BUILD_CHECKSUM__';

process.on('SIGINT', () => process.exit(0));

const yargsInstance = yargs(hideBin(process.argv))
  .scriptName('nve')
  .usage('$0 <cmd> [args]')
  .version(VERSION)
  .option('upgrade', { type: 'boolean', describe: 'Upgrade Elements CLI (nve) to the latest version' })
  .option('debug', { type: 'boolean', describe: 'Enable debug output for tools', default: false })
  .recommendCommands()
  .fail(message => {
    // allow missing positionals to fall through to interactive prompts
    if (message?.includes('Not enough non-option arguments') || message?.includes('Missing required argument')) {
      return;
    }

    if (message !== null) {
      console.error(colors.error(message));
    }
    process.exit(1);
  });

yargsInstance.wrap(yargsInstance.terminalWidth());

yargsInstance.middleware(argv => {
  if (argv.debug) {
    process.env.ELEMENTS_DEBUG = 'true';
  }
});

yargsInstance.command(
  'install [source]',
  false,
  builder => builder.positional('source', { type: 'string' }),
  async argv => {
    try {
      await installNve({ source: typeof argv.source === 'string' ? argv.source : process.execPath });
      process.exit(0);
    } catch (e) {
      console.error(colors.error(e instanceof Error ? e.message : String(e)));
      process.exit(1);
    }
  }
);

yargsInstance.command(
  '$0',
  'About and help',
  () => {},
  async () => {
    if (process.argv.includes('--upgrade')) {
      const upgradeTool = tools.find(tool => tool.metadata.command === 'cli.upgrade') as ManagedToolMethod<unknown>;
      console.log(colors.info('Upgrading Elements CLI...'));
      const { result, status, message } = await runAsyncTool({}, upgradeTool, { interactiveProgress: false });
      if (status === 'complete') {
        await exitWithCompleteToolResult({ result });
      } else {
        await exitWithToolError(result, message);
      }
    } else {
      const greeting = isInteractiveTerminal(process.stdout)
        ? colors.complete(`\x1b[?7l\n${JSON.parse(banner)}\n\n`)
        : '';
      console.log(
        `${greeting}${colors.complete(`@nvidia-elements/cli (${BUILD_SHA})`)}\n\n${await yargsInstance.getHelp()}`
      );
      await notifyIfUpdateAvailable(BUILD_SHA);
    }
  }
);

function getYargsOptions(prop: Schema) {
  const options: {
    describe?: string;
    type: 'string' | 'number' | 'boolean';
    array?: boolean;
    choices?: string[];
    default?: unknown;
  } = {
    describe: prop.description,
    type: prop.type === 'number' || prop.type === 'boolean' ? prop.type : 'string'
  };
  if (prop.type === 'array') options.array = true;
  if (prop.enum) options.choices = prop.enum;
  if (prop.default !== undefined) options.default = prop.default;
  return options;
}

function getPositionalArgument(key: string, prop: Schema, positional?: { optional?: boolean; variadic?: boolean }) {
  const optional = positional?.optional === true;
  const variadic = positional?.variadic === true || prop.type === 'array';
  return `${optional ? '[' : '<'}${key}${variadic ? '..' : ''}${optional ? ']' : '>'}`;
}

function getCommandArguments({
  positionalArgs,
  optionArgs,
  hasVariadicArg,
  hasCliPositionals
}: {
  positionalArgs: string[];
  optionArgs: string[];
  hasVariadicArg: boolean;
  hasCliPositionals: boolean;
}) {
  if (hasCliPositionals) return positionalArgs;
  return hasVariadicArg ? [...optionArgs, ...positionalArgs] : [...positionalArgs, ...optionArgs];
}

function normalizeOptionNames(args: Record<string, unknown>, optionNames?: Record<string, string>) {
  if (!optionNames) return args;
  const aliasNames = new Set(Object.values(optionNames));
  const normalized = Object.fromEntries(Object.entries(args).filter(([key]) => !aliasNames.has(key)));
  Object.entries(optionNames).forEach(([key, optionName]) => {
    if (optionName in args) normalized[key] = args[optionName];
  });
  return normalized;
}

tools
  .filter(tool => tool.metadata.support & ToolSupport.CLI)
  // eslint-disable-next-line max-lines-per-function
  .forEach(tool => {
    const { inputSchema, summary, cli } = tool.metadata;
    const excluded = new Set(cli?.exclude ?? []);
    const properties = {
      ...Object.fromEntries(Object.entries(inputSchema?.properties ?? {}).filter(([key]) => !excluded.has(key))),
      ...cli?.properties
    };
    const requiredArgs = Object.keys(properties).filter(key => inputSchema?.required?.includes(key));
    const positionalKeys = [
      ...requiredArgs,
      ...Object.keys(cli?.positionals ?? {}).filter(key => !requiredArgs.includes(key))
    ];
    const optionalArgs = Object.keys(properties).filter(
      key => !requiredArgs.includes(key) && !positionalKeys.includes(key)
    );
    const hasVariadicArg = positionalKeys.some(
      key => cli?.positionals?.[key]?.variadic || properties[key]?.type === 'array'
    );
    const positionalArgs = positionalKeys.map(key =>
      getPositionalArgument(key, properties[key]!, cli?.positionals?.[key])
    );
    const optionArgs = optionalArgs.map(key => `[${hasVariadicArg ? '--' : ''}${cli?.optionNames?.[key] ?? key}]`);
    const commandArgs = getCommandArguments({
      positionalArgs,
      optionArgs,
      hasVariadicArg,
      hasCliPositionals: cli?.positionals !== undefined
    });

    const command = `${tool.metadata.command} ${commandArgs.join(' ')}`.trim();

    yargsInstance.command(
      command,
      summary,
      // builder to add arguments metadata
      async builder => {
        positionalKeys.forEach(key => builder.positional(key, getYargsOptions(properties[key]!)));
        optionalArgs.forEach(key => builder.option(cli?.optionNames?.[key] ?? key, getYargsOptions(properties[key]!)));
      },
      // main handler for the command
      async args => {
        const start = performance.now();
        const parsedArgs = normalizeOptionNames(args as Record<string, unknown>, cli?.optionNames);
        const input = cli?.transformInput ? await cli.transformInput(parsedArgs) : parsedArgs;
        const { result, status, message } = await runAsyncTool(input, tool);
        const end = performance.now();

        if (status === 'complete') {
          await exitWithCompleteToolResult({
            result,
            tool,
            start,
            end,
            formattedResult: cli?.formatOutput ? await cli.formatOutput(result, parsedArgs) : undefined,
            exitCode: cli?.exitCode?.(result),
            notifyUpdate: () => notifyIfUpdateAvailable(BUILD_SHA)
          });
        } else {
          await exitWithToolError(result, message);
        }
      },
      // middleware to get interactive arguments when missing
      [
        async argv => {
          const interactive = !!requiredArgs.find(p => !argv[p]);
          const argNames = interactive
            ? [...requiredArgs, ...optionalArgs.filter(key => properties?.[key]?.default === undefined)]
            : requiredArgs;
          for (const argName of argNames) {
            if (!argv[argName]) {
              const propertySchema = properties[argName] ?? {};
              const v = await getArgValue(argName, propertySchema);
              argv[argName] = v;
            }
          }

          Object.entries(properties)
            .filter(([, property]) => property.type === 'array')
            .forEach(([argName, property]) => {
              if (argv[argName] === undefined) return;
              const values = (Array.isArray(argv[argName]) ? argv[argName] : [argv[argName]])
                .flatMap(value => (typeof value === 'string' ? value.split(',') : []))
                .map(value => value.trim())
                .filter(Boolean);
              if (property.minItems !== undefined && values.length < property.minItems) {
                console.error(
                  colors.error(`${tool.metadata.command} accepts at least ${property.minItems} ${argName}.`)
                );
                process.exit(1);
              }
              if (property.maxItems !== undefined && values.length > property.maxItems) {
                console.error(
                  colors.error(`${tool.metadata.command} accepts at most ${property.maxItems} ${argName}.`)
                );
                process.exit(1);
              }
              argv[argName] = values;
            });
        }
      ]
    );
  });

yargsInstance.command(
  'mcp',
  'Start the MCP server',
  () => {},
  async () => {
    const { startMcpServer } = await import('./mcp/index.js');
    await startMcpServer();
  }
);

void yargsInstance.parse();
