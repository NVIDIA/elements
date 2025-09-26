#!/usr/bin/env node

/* istanbul ignore file -- @preserve */
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import { tools, type Schema } from '@nve-internals/tools';
import { banner, colors, getArgValue, renderResult, runAsyncTool } from './utils.js';

export const VERSION = '0.0.0';

process.env.ELEMENTS_ENV = 'cli';

process.on('SIGINT', () => process.exit(0));

const yargsInstance = yargs(hideBin(process.argv))
  .scriptName('nve')
  .usage('$0 <cmd> [args]')
  .version(VERSION)
  .recommendCommands()
  .fail(message => {
    if (message !== null) {
      console.log(colors.error(message));
    }
    process.exit(1);
  });

yargsInstance.wrap(yargsInstance.terminalWidth());

yargsInstance.command(
  '$0',
  'About and help',
  () => {},
  async () => {
    const greeting = colors.complete(`\x1b[?7l\n${JSON.parse(banner)}\n\n`);
    console.log(`${greeting}${colors.complete('@nvidia-elements/cli version ' + VERSION)}\n${await yargsInstance.getHelp()}`);
  }
);

tools.forEach(tool => {
  const { inputSchema, description } = tool.metadata;
  const { properties, required } = inputSchema ?? {};
  const requiredArgs = Object.keys(properties ?? {}).filter(key => required?.includes(key));
  const optionalArgs = Object.keys(properties ?? {}).filter(
    key => !required?.includes(key) || properties?.[key].default
  );

  // todo: make positionals use <> syntax and continue to fallback to inquirer/prompts
  const command =
    `${tool.metadata.command} ${[...requiredArgs.map(key => `[${key}]`), ...optionalArgs.map(key => `[${key}]`)].join(' ')}`.trim();

  yargsInstance.command(
    command,
    description,
    // builder to add arguments metadata
    async builder => {
      const argOptions = (prop: Schema) => ({
        describe: prop.description,
        type: prop.type as 'string' | 'number' | 'boolean',
        choices: prop.enum ?? undefined,
        default: prop.default
      });

      requiredArgs.forEach(key => builder.positional(key, argOptions(properties[key])));
      optionalArgs.forEach(key => builder.option(key, argOptions(properties[key])));
    },
    // main handler for the command
    async args => {
      const { result, status, message } = await runAsyncTool(args, tool);

      if (status === 'success') {
        await renderResult(result);
        process.exit(0);
      } else {
        console.log(colors.error(message ?? 'unknown error'));
        process.exit(1);
      }
    },
    // middleware to get interactive arguments
    [
      async argv => {
        const interactive = !!requiredArgs.find(p => !argv[p]);
        const argNames = interactive
          ? [...requiredArgs, ...optionalArgs.filter(key => properties?.[key].default === undefined)]
          : requiredArgs;
        for (const argName of argNames) {
          if (!argv[argName]) {
            const propertySchema = properties?.[argName];
            const v = await getArgValue(argName, propertySchema);
            argv[argName] = v;
          }
        }
      }
    ]
  );
});

void yargsInstance.parse();
