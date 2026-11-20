// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { parser } from '@lezer/json';
import { describe, expect, it } from 'vitest';
import { getParser, registerLanguage } from './language-registry.js';

describe('language registry', () => {
  it('looks up a language regardless of case', () => {
    expect(getParser('test-json')).toBeUndefined();
    registerLanguage('Test-Json', parser);
    expect(getParser('test-json')).toBe(parser);
    expect(getParser('TEST-JSON')).toBe(parser);
  });
});
