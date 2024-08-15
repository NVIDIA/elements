import { mergeConfig } from 'vitest/config';
import { libraryTestConfig } from './test.js';

/** @type {import('vite').UserConfig} */
export const libraryAxeTestConfig = mergeConfig(libraryTestConfig, {});
