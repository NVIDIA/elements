import { readFileSync, writeFileSync } from 'node:fs';
import { builtinModules } from 'node:module';
import { createHash } from 'node:crypto';
import { defineConfig, mergeConfig, type Plugin } from 'vite';
import { libraryNodeBuildConfig } from '@internals/vite';
import semanticRelease from 'semantic-release';

const NODE_BUILT_IN_MODULES = builtinModules.filter(m => !m.startsWith('_'));
NODE_BUILT_IN_MODULES.push(...NODE_BUILT_IN_MODULES.map(m => `node:${m}`));

export default defineConfig(() => {
  const libConfig = libraryNodeBuildConfig;
  if (libConfig.build?.rolldownOptions?.external) {
    libConfig.build.rolldownOptions.external = NODE_BUILT_IN_MODULES;
    if (libConfig.build.rolldownOptions.output) {
      libConfig.build.rolldownOptions.output[0].preserveModules = false;
    }
  }

  return mergeConfig(libConfig, {
    build: {
      ssr: true // trick vite to build with node deps
    },
    plugins: [buildBinaryVersionPlugin()]
  });
});

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
      writeFileSync('dist/manifest.json', JSON.stringify({ sha: hash }));
    }
  };
}

/**
 * This pre-computes the next release version. This is only needed for the CLI
 * package since semantic release can't modify the version of the binaries after they are built.
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

  return releaseResult ? releaseResult.nextRelease.version : '0.0.0';
}
