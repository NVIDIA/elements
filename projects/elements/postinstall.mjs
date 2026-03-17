/**
 * @nvidia-elements/core postinstall script
 *
 * Displays a one-time advertisement for the Elements CLI & MCP Server
 * after package installation. Suppressed in CI, non-interactive terminals,
 * and when the user already has the CLI/MCP configured.
 */
import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { homedir } from 'node:os';

try {
  // Skip in CI environments
  const env = process.env;
  if (env.CI || env.CONTINUOUS_INTEGRATION || env.BUILD_NUMBER) {
    process.exit(0);
  }

  // Skip in non-interactive terminals
  if (!process.stdout.isTTY) {
    process.exit(0);
  }

  // Skip if npm output is silenced
  if (env.npm_config_loglevel === 'silent') {
    process.exit(0);
  }

  // Skip if shown within the last 7 days
  const ONE_WEEK = 7 * 24 * 60 * 60 * 1000;
  const stampDir = join(homedir(), '.nve');
  const stampFile = join(stampDir, 'setup-mcp.json');
  try {
    if (existsSync(stampFile)) {
      const { lastCheck } = JSON.parse(readFileSync(stampFile, 'utf-8'));
      if (Date.now() - lastCheck < ONE_WEEK) {
        process.exit(0);
      }
    }
  } catch {
    // ignore read errors
  }

  // Detect if the CLI/MCP is already configured in the project
  const root = env.INIT_CWD || process.cwd();

  // Check MCP config files for an existing "elements" server entry (covers both
  // published package references like "nve-mcp" and local dev paths)
  const mcpFiles = [join(root, '.cursor', 'mcp.json'), join(root, '.mcp.json')];
  for (const file of mcpFiles) {
    try {
      if (existsSync(file)) {
        const content = readFileSync(file, 'utf-8');
        const config = JSON.parse(content);
        if (config?.mcpServers?.elements) {
          process.exit(0);
        }
      }
    } catch {
      // ignore read/parse errors
    }
  }

  // Check package.json for the CLI as a dependency
  try {
    const pkgPath = join(root, 'package.json');
    if (existsSync(pkgPath)) {
      const content = readFileSync(pkgPath, 'utf-8');
      if (content.includes('@nvidia-elements/cli')) {
        process.exit(0);
      }
    }
  } catch {
    // ignore read errors
  }

  // Print the advertisement
  const color = !env.NO_COLOR;
  const g = color ? '\x1b[32m' : ''; // green
  const c = color ? '\x1b[36m' : ''; // cyan
  const d = color ? '\x1b[2m' : ''; // dim
  const r = color ? '\x1b[0m' : ''; // reset
  const b = color ? '\x1b[1m' : ''; // bold

  const rule = `${d}${'─'.repeat(72)}${r}`;

  const lines = [
    '',
    rule,
    ` ${b}${g}Elements CLI & MCP Server${r}`,
    '',
    ` Supercharge your development with API search, template validation,`,
    ` project scaffolding, and AI assistant integration.`,
    '',
    ` ${c}nve project.setup${r}`,
    '',
    ` ${d}https://NVIDIA.github.io/elements/docs/mcp/${r}`,
    rule,
    ''
  ];

  console.log(lines.join('\n'));

  // Record timestamp so the ad is not shown again for 7 days
  try {
    mkdirSync(stampDir, { recursive: true });
    writeFileSync(stampFile, JSON.stringify({ lastCheck: Date.now() }, null, 2));
  } catch {
    // ignore write errors
  }
} catch {
  // Never fail the install
}
