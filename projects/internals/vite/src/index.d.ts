// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type { UserConfig } from 'vite';
import type { Page } from 'playwright';

export declare const libraryBuildConfig: UserConfig;
export declare const libraryNodeBuildConfig: UserConfig;
export declare const libraryBundleConfig: UserConfig;
export declare const libraryTestConfig: UserConfig;
export declare const libraryBenchConfig: UserConfig;
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

export declare const VERSION: string;
