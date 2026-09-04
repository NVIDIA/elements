// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type { UserConfig } from 'vite';
import type { CDPSession, Page, ViewportSize } from 'playwright';

export declare const libraryBuildConfig: UserConfig;
export declare const libraryNodeBuildConfig: UserConfig;
export declare const libraryBundleConfig: UserConfig;
export declare const libraryTestConfig: UserConfig;
export declare const libraryBenchConfig: UserConfig;
export declare const libraryWebGPUTestConfig: UserConfig;
export declare const libraryNodeTestConfig: UserConfig;
export declare const libraryAxeTestConfig: UserConfig;
export declare const libraryLitSSRTestConfig: UserConfig;
export declare const libraryVisualTestConfig: UserConfig;
export declare const libraryLighthouseTestConfig: UserConfig;

export declare const lighthouseRunner: {
  open(): Promise<void>;
  close(): Promise<void>;
  getReport(
    name: string,
    content: string
  ): Promise<{
    name: string;
    payload: {
      javascript: { kb: number; requests: Record<string, { kb: number }> };
      css: { kb: number; requests: Record<string, { kb: number }> };
    };
    scores: { performance: number; accessibility: number; bestPractices: number };
  }>;
};

export declare const visualRunner: {
  open(): Promise<void>;
  close(): Promise<void>;
  render(
    name: string,
    content: string,
    options?: {
      network?: boolean;
      waitFor?: (waitForFunction: (...args: unknown[]) => Promise<unknown>) => Promise<void>;
    }
  ): Promise<{ maxDiffPercentage: number }>;
  inspect<Result>(
    name: string,
    content: string,
    inspectPage: (page: Page) => Result | Promise<Result>,
    options?: { deviceScaleFactor?: number }
  ): Promise<Result>;
  runWebGPUSmoke(name: string): Promise<WebGPUVisualDiagnostics>;
};

export interface WebGPUVisualDiagnostics {
  browserVersion: string;
  chromiumArgs: string[];
  secureContext: boolean;
  adapterInfo: {
    vendor: string;
    architecture: string;
    device: string;
    description: string;
    isFallbackAdapter?: boolean;
  } | null;
  software: boolean;
  workCompleted: boolean;
  clearFrame: boolean;
  clearPixel?: number[];
  expectedPixel?: number[];
  format?: string;
  error?: string;
}

export declare const ssrRunner: {
  render(content: unknown): Promise<string>;
};

export type WebGPUTestMode = 'check' | 'measure' | 'diagnostic' | 'lifecycle';

export interface WebGPUAdapterInfo {
  available: boolean;
  architecture?: string;
  description?: string;
  device?: string;
  isFallbackAdapter?: boolean | string;
  vendor?: string;
}

export interface WebGPUObservedResource {
  destroyed: boolean;
  destroyedEpoch: number | null;
  deviceId: number;
  epoch: number;
  id: number;
  label: string;
}

export interface WebGPUObservedBuffer extends WebGPUObservedResource {
  size: number;
  usage: number;
}

export interface WebGPUObservedTexture extends WebGPUObservedResource {
  depthOrArrayLayers: number;
  format: string;
  height: number;
  usage: number;
  width: number;
}

export interface WebGPUObservedWrite {
  bufferId: number | null;
  deviceId: number;
  epoch: number;
  offset: number;
  size: number;
  usage: number | null;
}

export interface WebGPUObserverSnapshot {
  buffers: WebGPUObservedBuffer[];
  destroys: Array<{ epoch: number; id: number; kind: 'buffer' | 'texture' }>;
  devices: Array<{ deviceId: number; epoch: number }>;
  draws: Array<{ deviceId: number; epoch: number; method: string }>;
  epoch: number;
  renderPasses: Array<{ deviceId: number; epoch: number }>;
  scissors: Array<{ deviceId: number; epoch: number; height: number; width: number; x: number; y: number }>;
  submits: Array<{ count: number; deviceId: number; epoch: number }>;
  textureCopies: Array<{ deviceId: number; epoch: number }>;
  textures: WebGPUObservedTexture[];
  writes: WebGPUObservedWrite[];
}

export interface WebGPUTestEnvironment {
  adapter: WebGPUAdapterInfo;
  browser: { name: string; version: string };
  buildMode: string;
  devicePixelRatio: number;
  host: { architecture: string; cpu: string; operatingSystem: string };
  powerState: string;
  viewport: ViewportSize | null;
  worktree: { commit: string; status: string };
}

export interface WebGPUProductionBoundary {
  allowedFiles: string[];
  bundleBytes: number;
  files: Array<{ bytes: number; path: string; sha256: string }>;
}

export declare class WebGPUTestSession {
  adapter: WebGPUAdapterInfo;
  readonly errors: string[];
  readonly page: Page;
  call<Result = unknown>(method: string, ...args: unknown[]): Promise<Result>;
  resetObserver(): Promise<void>;
  snapshotObserver(): Promise<WebGPUObserverSnapshot>;
  createCDPSession(): Promise<CDPSession>;
  close(): Promise<void>;
}

export declare class WebGPUTestRunner {
  constructor(options?: {
    adapterMode?: 'native' | 'software';
    executablePath?: string;
    harnessPath?: string;
    headless?: boolean;
    mode?: WebGPUTestMode;
    outputRoot?: string;
    projectRoot?: string;
  });
  readonly mode: WebGPUTestMode;
  readonly projectRoot: string;
  open(): Promise<void>;
  close(): Promise<void>;
  load(options?: {
    allowedConsoleErrors?: string[];
    deviceScaleFactor?: number;
    observeWebGPU?: boolean;
    profile?: string;
    readyTimeout?: number;
    viewport?: ViewportSize;
  }): Promise<WebGPUTestSession>;
  environmentReport(session: WebGPUTestSession): Promise<WebGPUTestEnvironment>;
  inspectProductionBoundary(options?: {
    directory?: string;
    forbiddenSourcePatterns?: Array<{ message: string; pattern: RegExp }>;
    forbiddenTokens?: string[];
    isAllowedFile?: (path: string) => boolean;
    isForbiddenFile?: (path: string) => boolean;
  }): Promise<WebGPUProductionBoundary>;
  captureTrace(
    session: WebGPUTestSession,
    options: {
      categories?: string;
      finalizationTimeout?: number;
      label?: string;
      run(): Promise<void>;
      traceOptions?: string;
    }
  ): Promise<string>;
  writeReport(label: string, report: unknown): Promise<string>;
  writeArtifact(label: string, suffix: string, contents: string): Promise<string>;
}

export declare const WEBGPU_BUFFER_USAGE: Readonly<{ storage: number; uniform: number }>;
export declare function getWebGPUTestMode(): WebGPUTestMode;
export declare function assertNativeWebGPUAdapter(adapter: WebGPUAdapterInfo): void;
export declare function collectWebGPUMemorySnapshot(
  cdp: CDPSession,
  page: Page
): Promise<{ browser: unknown; cdp: Record<string, number> }>;
export declare function getWebGPUWrites(
  snapshot: WebGPUObserverSnapshot,
  requiredUsage: number,
  excludedUsage?: number
): WebGPUObservedWrite[];
export declare function getCurrentWebGPUTextures(snapshot: WebGPUObserverSnapshot): WebGPUObservedTexture[];
export declare function summarizeWebGPUWrites(writes: readonly WebGPUObservedWrite[]): {
  bytes: number;
  count: number;
};
export declare function summarizeWebGPUResources(snapshot: WebGPUObserverSnapshot): {
  bufferCreates: number;
  bufferDestroys: number;
  draws: number;
  liveBuffers: number;
  liveTextures: number;
  onePixelScissors: number;
  renderPasses: number;
  submits: number;
  textureCopies: number;
  textureCreates: number;
  textureDestroys: number;
  writes: { bytes: number; count: number };
};
export declare function median(values: ReadonlyArray<number | null>): number | null;
export declare function positiveEnvironmentInteger(name: string, fallback: number): number;
export declare function delay(milliseconds: number): Promise<void>;

export declare const VERSION: string;
