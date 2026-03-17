import { defineConfig, mergeConfig } from 'vite';
import { libraryNodeBuildConfig } from '@internals/vite';
import { builtinModules } from 'node:module';

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
    }
  });
});
