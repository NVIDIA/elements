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
import { banner, colors, exitWithCompleteToolResult, exitWithToolError, getArgValue, runAsyncTool } from './utils.js';
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
      const greeting = colors.complete(`\x1b[?7l\n${JSON.parse(banner)}\n\n`);
      console.log(
        `${greeting}${colors.complete(`@nvidia-elements/cli (${BUILD_SHA})`)}\n\n${await yargsInstance.getHelp()}`
      );
      await notifyIfUpdateAvailable(BUILD_SHA);
    }
  }
);

tools
  .filter(tool => tool.metadata.support & ToolSupport.CLI)
  // eslint-disable-next-line max-lines-per-function
  .forEach(tool => {
    const { inputSchema, summary } = tool.metadata;
    const { properties, required } = inputSchema ?? {};
    const requiredArgs = Object.keys(properties ?? {}).filter(key => required?.includes(key));
    const optionalArgs = Object.keys(properties ?? {}).filter(
      key => !required?.includes(key) || properties?.[key]?.default
    );
    const hasVariadicArg = requiredArgs.some(key => properties?.[key]?.type === 'array');
    const positionalArgs = requiredArgs.map(key => (properties?.[key]?.type === 'array' ? `<${key}..>` : `<${key}>`));
    const optionArgs = optionalArgs.map(key => `[${hasVariadicArg ? '--' : ''}${key}]`);
    const commandArgs = hasVariadicArg ? [...optionArgs, ...positionalArgs] : [...positionalArgs, ...optionArgs];

    const command = `${tool.metadata.command} ${commandArgs.join(' ')}`.trim();

    yargsInstance.command(
      command,
      summary,
      // builder to add arguments metadata
      async builder => {
        if (!properties) return;

        const argOptions = (prop: Schema) => ({
          describe: prop.description,
          type: (prop.type === 'array' ? 'string' : prop.type) as 'string' | 'number' | 'boolean',
          ...(prop.type === 'array' ? { array: true } : {}),
          choices: prop.enum ?? undefined,
          default: prop.default
        });

        requiredArgs.forEach(key => builder.positional(key, argOptions(properties[key]!)));
        optionalArgs.forEach(key => builder.option(key, argOptions(properties[key]!)));
      },
      // main handler for the command
      async args => {
        const start = performance.now();
        const { result, status, message } = await runAsyncTool(args, tool);
        const end = performance.now();

        if (status === 'complete') {
          await exitWithCompleteToolResult({
            result,
            tool,
            start,
            end,
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
              const propertySchema = properties?.[argName] ?? {};
              const v = await getArgValue(argName, propertySchema);
              argv[argName] = v;
            }
          }

          Object.entries(properties ?? {})
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
