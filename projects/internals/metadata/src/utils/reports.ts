// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type { PackageDownload, ProjectTestSummary, Release } from '../types.js';

export interface ProjectsTestSummary {
  created: string;
  projects: Record<string, ProjectTestSummary>;
}

export interface ReleasesSummary {
  created: string;
  data: Release[];
}

export interface DownloadsSummary {
  created: string;
  packages: PackageDownload[];
  totalDownloads: number;
}
