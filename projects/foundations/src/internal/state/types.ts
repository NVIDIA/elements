// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

declare global {
  var NVE_ELEMENTS: ElementsGlobal;
}

export interface ElementsGlobal {
  state: {
    bundle: boolean;
    env: 'watch' | 'production' | 'development';
    pageHost: string;
    moduleHost: string;
    versions: string[];
    scopedRegistry: { [key: string]: CustomElementRegistry };
    elementRegistry: Readonly<{ [key: string]: string }>;
    i18nRegistry: Readonly<{ [key: string]: string }>;
    audit: Readonly<{
      [key: string]: {
        count?: number;
        excessiveInstanceLimitAudited?: boolean;
      };
    }>;
  };
  debug: (log?: (...args: unknown[]) => void) => void;
}
