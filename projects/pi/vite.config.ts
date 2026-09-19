import { defineConfig } from 'vite';
import { libraryNodeBuildConfig } from '@internals/vite';

export default defineConfig(() => {
  const output = libraryNodeBuildConfig.build?.rolldownOptions?.output?.[0];
  if (output) output.preserveModules = false;
  return libraryNodeBuildConfig;
});
