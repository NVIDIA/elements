import type { UserConfig } from 'vite';

export declare function libraryBuildConfig(config?: UserConfig): UserConfig;
export declare function libraryNodeBuildConfig(config?: UserConfig): UserConfig;
export declare function libraryBundleConfig(config?: UserConfig): UserConfig;
export declare function libraryTestConfig(config?: UserConfig): UserConfig;
export declare function libraryNodeTestConfig(config?: UserConfig): UserConfig;
export declare function libraryAxeTestConfig(config?: UserConfig): UserConfig;
export declare function libraryLitSSRTestConfig(config?: UserConfig): UserConfig;
export declare function libraryVisualTestConfig(config?: UserConfig): UserConfig;
export declare function libraryLighthouseTestConfig(config?: UserConfig): UserConfig;

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
};

export declare const ssrRunner: {
  render(content: unknown): Promise<string>;
};

export declare const VERSION: string;
