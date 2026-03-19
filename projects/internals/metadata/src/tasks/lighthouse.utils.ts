// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { readFileSync, existsSync } from 'node:fs';

function loadLighthouseReport(basePath: string) {
  const lighthouseReportPath = new URL(basePath + '/.lighthouse/dist/report.json', import.meta.url);
  return existsSync(lighthouseReportPath) ? JSON.parse(readFileSync(lighthouseReportPath, 'utf8')) : null;
}

export interface LighthouseScores {
  created: string;
  '@nvidia-elements/core': { [key: string]: LighthouseElementReport };
  '@nvidia-elements/styles': { [key: string]: LighthouseElementReport };
  '@nvidia-elements/themes': { [key: string]: LighthouseElementReport };
  '@nvidia-elements/forms': { [key: string]: LighthouseElementReport };
}

export interface LighthouseElementReport {
  name: string;
  payload: {
    javascript: {
      kb: number;
      requests: {
        [key: string]: {
          kb: number;
          name: string;
        };
      };
    };
    css: {
      kb: number;
      requests: {
        [key: string]: {
          kb: number;
          name: string;
        };
      };
    };
  };
  scores: {
    performance: number;
    accessibility: number;
    bestPractices: number;
  };
}

export async function generateLighthouseReport(): Promise<LighthouseScores> {
  return {
    created: new Date().toISOString(),
    '@nvidia-elements/core': await loadLighthouseReport('../../../../elements'),
    '@nvidia-elements/styles': await loadLighthouseReport('../../../../styles'),
    '@nvidia-elements/themes': await loadLighthouseReport('../../../../themes'),
    '@nvidia-elements/forms': await loadLighthouseReport('../../../../forms'),
  };
}

export async function getLighthouseReport(): Promise<LighthouseScores> {
  return JSON.parse(readFileSync('./static/lighthouse.json', 'utf8'));
}
