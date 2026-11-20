// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type { Parser } from '@lezer/common';

const parsers = new Map<string, Parser>();

export function registerLanguage(name: string, parser: Parser): void {
  parsers.set(name.toLowerCase(), parser);
}

export function getParser(name: string): Parser | undefined {
  return parsers.get(name?.toLowerCase());
}
