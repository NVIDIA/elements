// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it } from 'vitest';
import { formatFileSize, shiftLeft } from './strings.js';

const resultTwoSpaceIndent = `function getTime(): number {
  return new Date().getTime();
}`;

const resultFourSpaceIndent = `function getTime(): number {
    return new Date().getTime();
}`;

const newlines = `
function getTime(): number {
  return new Date().getTime();
}
`;

const twoSpaceIndent = `
  function getTime(): number {
    return new Date().getTime();
  }
`;

const fourSpaceIndent = `
    function getTime(): number {
        return new Date().getTime();
    }
`;

describe('shiftLeft', () => {
  it('it should remove leading newlines', () => {
    expect(shiftLeft(newlines)).toBe(resultTwoSpaceIndent);
  });

  it('it should remove leading newlines and whitespace (2 space indent)', () => {
    expect(shiftLeft(twoSpaceIndent)).toBe(resultTwoSpaceIndent);
  });

  it('it should remove leading newlines and whitespace (4 space indent)', () => {
    expect(shiftLeft(fourSpaceIndent)).toBe(resultFourSpaceIndent);
  });

  it('should format bytes correctly', () => {
    expect(formatFileSize(500)).to.equal('500.00 B');
    expect(formatFileSize(1024)).to.equal('1.00 KB');
    expect(formatFileSize(1048576)).to.equal('1.00 MB');
    expect(formatFileSize(1073741824)).to.equal('1.00 GB');
    expect(formatFileSize(0)).to.equal('0');
  });
});
