import process from 'node:process';
import { libraryNodeTestConfig } from './test.node.js';

const mode = process.env.WEBGPU_TEST_MODE ?? 'check';
const testTimeout = new Map([
  ['check', 60_000],
  ['diagnostic', 120_000],
  ['lifecycle', 180_000],
  ['measure', 600_000]
]).get(mode);
if (testTimeout === undefined) throw new Error(`Unknown WebGPU test mode: ${mode}`);

/** @type {import('vite').UserConfig} */
export const libraryWebGPUTestConfig = {
  ...libraryNodeTestConfig,
  cacheDir: 'node_modules/.vite-webgpu',
  test: {
    ...libraryNodeTestConfig.test,
    bail: 0,
    fileParallelism: false,
    hookTimeout: 120_000,
    include: ['./src/**/*.test.webgpu.ts'],
    isolate: false,
    maxConcurrency: 1,
    maxWorkers: 1,
    outputFile: {
      json: './coverage/webgpu/summary.json',
      junit: './coverage/webgpu/junit.xml'
    },
    retry: 0,
    testTimeout
  }
};
