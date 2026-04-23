// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

export interface ReportCheck {
  message: string;
  status: 'success' | 'danger' | 'info' | 'warning' | 'log';
}

export interface Report {
  [key: string]: ReportCheck;
}

export interface PackageData {
  devDependencies: Record<string, string>;
  dependencies: Record<string, string>;
  peerDependencies: Record<string, string>;
}
