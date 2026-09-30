import { readFileSync, writeFileSync } from 'node:fs';
import { builtinModules } from 'node:module';
import { createHash } from 'node:crypto';
import { basename, dirname, resolve } from 'node:path';
import { defineConfig, mergeConfig, type Plugin } from 'vite';
import { libraryNodeBuildConfig } from '@internals/vite';
import semanticRelease from 'semantic-release';

const NODE_BUILT_IN_MODULES = builtinModules.flatMap(m => (m.startsWith('_') ? [] : [m, `node:${m}`]));
const MCP_UI_SOURCE_DIR = resolve(import.meta.dirname, 'src/mcp/ui');
const MCP_UI_OUTPUT_DIR = resolve(import.meta.dirname, 'dist/mcp/ui');
const PACKAGE_JSON_PATH = resolve(import.meta.dirname, 'package.json');

export default defineConfig(() => {
  const libConfig = libraryNodeBuildConfig;
  const rollupOptions = libConfig.build?.rolldownOptions;
  if (rollupOptions?.external) rollupOptions.external = NODE_BUILT_IN_MODULES;
  if (rollupOptions?.output?.[0]) rollupOptions.output[0].preserveModules = false;

  return mergeConfig(libConfig, {
    build: {
      ssr: true // trick vite to build with node deps
    },
    plugins: [loadMcpUiResourcesPlugin(), buildBinaryVersionPlugin()]
  });
});

function loadMcpUiResourcesPlugin(): Plugin {
  return {
    name: 'load-mcp-ui-resources',
    enforce: 'pre',
    load(id) {
      const htmlPath = id.match(/^(.+\.html)\?raw(?:$|&)/)?.[1];
      if (!htmlPath || dirname(htmlPath) !== MCP_UI_SOURCE_DIR) return null;
      const html = readFileSync(resolve(MCP_UI_OUTPUT_DIR, basename(htmlPath)), 'utf-8');
      return `export default ${JSON.stringify(html)};`;
    }
  };
}

function buildBinaryVersionPlugin(): Plugin {
  return {
    name: 'build-binary-version',
    async closeBundle() {
      let content = readFileSync('dist/index.js', 'utf-8');
      const hash = createHash('sha256').update(content).digest('hex').slice(0, 12);
      content = content.replaceAll('__NVE_BUILD_CHECKSUM__', hash);

      if (process.env.CI) {
        const releaseVersion = await getNextReleaseVersion();
        content = content.replaceAll('0.0.0', releaseVersion);
      }

      writeFileSync('dist/index.js', content);
    }
  };
}

/**
 * Pre-computes the next release version for the CLI package because semantic
 * release cannot update binary versions after the build.
 */
async function getNextReleaseVersion() {
  const releaseResult = await semanticRelease(
    {
      dryRun: true,
      branches: ['main'],
      plugins: [
        [
          '@semantic-release/commit-analyzer',
          {
            parserOpts: {
              headerPattern: /^(\w+)(?:\(([^)]*)\))?(!)?: (.*)$/,
              headerCorrespondence: ['type', 'scope', 'breaking', 'subject']
            },
            releaseRules: [
              // Catch-all first: suppress default rules (false acts as baseline)
              { breaking: true, release: false },
              { type: 'feat', release: false },
              { type: 'fix', release: false },
              { type: 'perf', release: false },
              { type: 'revert', release: false },
              { type: 'chore', release: false },
              // Scope-matched rules last: override false for matching scope
              { breaking: true, scope: 'cli', release: 'major' },
              { type: 'feat', scope: 'cli', release: 'minor' },
              { type: 'fix', scope: 'cli', release: 'patch' }
            ]
          }
        ]
      ]
    },
    {
      cwd: process.cwd(),
      env: process.env
    }
  );

  return releaseResult?.nextRelease?.version ?? getPackageVersion();
}

function getPackageVersion() {
  const packageJson: unknown = JSON.parse(readFileSync(PACKAGE_JSON_PATH, 'utf-8'));
  if (!packageJson || typeof packageJson !== 'object' || !('version' in packageJson)) {
    return '0.0.0';
  }

  return typeof packageJson.version === 'string' ? packageJson.version : '0.0.0';
}
