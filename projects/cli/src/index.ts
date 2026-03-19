#!/usr/bin/env node
process.env.ELEMENTS_ENV = 'cli';

/* istanbul ignore file -- @preserve */
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import { tools, ToolSupport, type Schema } from '@internals/tools';
import { banner, colors, getArgValue, renderResult, runAsyncTool } from './utils.js';
import { checkForUpdates, notifyIfUpdateAvailable, upgrade } from './update.js';

export const VERSION = '0.0.0';
export const BUILD_SHA = '__NVE_BUILD_CHECKSUM__';

let updateCheck: Promise<boolean>;
function getUpdateCheck() {
  updateCheck ??= checkForUpdates(BUILD_SHA);
  return updateCheck;
}

process.on('SIGINT', () => process.exit(0));

if (process.argv.includes('--upgrade')) {
  upgrade();
}

const yargsInstance = yargs(hideBin(process.argv))
  .scriptName('nve')
  .usage('$0 <cmd> [args]')
  .version(VERSION)
  .option('upgrade', { type: 'boolean', describe: 'Upgrade nve CLI to the latest version' })
  .recommendCommands()
  .fail(message => {
    // allow missing positionals to fall through to interactive prompts
    if (message?.includes('Not enough non-option arguments') || message?.includes('Missing required argument')) {
      return;
    }

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
    await notifyIfUpdateAvailable(getUpdateCheck());
  }
);

tools
  .filter(tool => tool.metadata.support & ToolSupport.CLI)
  .forEach(tool => {
    const { inputSchema, summary } = tool.metadata;
    const { properties, required } = inputSchema ?? {};
    const requiredArgs = Object.keys(properties ?? {}).filter(key => required?.includes(key));
    const optionalArgs = Object.keys(properties ?? {}).filter(
      key => !required?.includes(key) || properties?.[key]?.default
    );

    const command =
      `${tool.metadata.command} ${[...requiredArgs.map(key => `<${key}>`), ...optionalArgs.map(key => `[${key}]`)].join(' ')}`.trim();

    yargsInstance.command(
      command,
      summary,
      // builder to add arguments metadata
      async builder => {
        if (!properties) return;

        const argOptions = (prop: Schema) => ({
          describe: prop.description,
          type: prop.type as 'string' | 'number' | 'boolean',
          choices: prop.enum ?? undefined,
          default: prop.default
        });

        requiredArgs.forEach(key => builder.positional(key, argOptions(properties[key]!)));
        optionalArgs.forEach(key => builder.option(key, argOptions(properties[key]!)));
      },
      // main handler for the command
      async args => {
        const { result, status, message } = await runAsyncTool(args, tool);

        if (status === 'complete') {
          await renderResult(result);
          await notifyIfUpdateAvailable(getUpdateCheck());
          process.exit(0);
        } else {
          console.log(colors.error(message ?? 'unknown error'));
          process.exit(1);
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
            } else if (properties?.[argName]?.type === 'array' && typeof argv[argName] === 'string') {
              argv[argName] = (argv[argName] as string)
                .split(',')
                .map(s => s.trim())
                .filter(Boolean);
            }
          }
        }
      ]
    );
  });

yargsInstance.command(
  'mcp',
  'Start the MCP server',
  () => {},
  async () => {
    const { startMcpServer } = await import('./mcp/mcp.js');
    await startMcpServer();
  }
);

void yargsInstance.parse();
