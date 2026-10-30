import { mergeConfig } from 'vitest/config';
import { libraryRenderTestConfig } from '@internals/vite';

export default mergeConfig(libraryRenderTestConfig, { root: import.meta.dirname });
