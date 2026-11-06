// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

export function parseVersion(version: string) {
  const [major, minor, patch] = version.split('.').map(v => {
    const n = parseInt(v, 10);
    return Number.isNaN(n) ? -1 : n;
  });
  return { major: major ?? -1, minor: minor ?? -1, patch: patch ?? -1 };
}

export function formatStandardNumber(number: number) {
  return new Intl.NumberFormat().format(number);
}
