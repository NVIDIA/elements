import { defineConfig, mergeConfig, type Plugin } from 'vite';
import { libraryNodeBuildConfig } from '@internals/vite';
import { builtinModules } from 'node:module';
import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';

const NODE_BUILT_IN_MODULES = builtinModules.filter(m => !m.startsWith('_'));
NODE_BUILT_IN_MODULES.push(...NODE_BUILT_IN_MODULES.map(m => `node:${m}`));

function buildChecksumPlugin(): Plugin {
  return {
    name: 'build-checksum',
    closeBundle() {
      const file = 'dist/index.js';
      const content = readFileSync(file, 'utf-8');
      const hash = createHash('sha256').update(content).digest('hex').slice(0, 12);
      writeFileSync(file, content.replaceAll('__NVE_BUILD_CHECKSUM__', hash));
      writeFileSync('dist/manifest.json', JSON.stringify({ sha: hash }));
    }
  };
}

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
    plugins: [buildChecksumPlugin()]
  });
});
