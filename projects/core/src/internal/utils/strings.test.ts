// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it } from 'vitest';
import { formatFileSize, shiftLeft } from './strings.js';

describe('formatFileSize', () => {
  it('should format bytes correctly', () => {
    expect(formatFileSize(500)).to.equal('500.00 B');
    expect(formatFileSize(1024)).to.equal('1.00 KB');
    expect(formatFileSize(1048576)).to.equal('1.00 MB');
    expect(formatFileSize(1073741824)).to.equal('1.00 GB');
    expect(formatFileSize(0)).to.equal('0');
  });
});

describe('shiftLeft', () => {
  it('should trim surrounding newlines', () => {
    expect(shiftLeft('\nfirst\n  second\n')).toBe('first\n  second');
  });

  it('should remove two spaces of outer indentation', () => {
    expect(shiftLeft('\n  first\n    second\n')).toBe('first\n  second');
  });

  it('should remove four spaces of outer indentation', () => {
    expect(shiftLeft('\n    first\n        second\n')).toBe('first\n    second');
  });
});
