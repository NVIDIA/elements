// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it } from 'vitest';

import { sameWorkspaceMeasurements, sameWorkspaceMeasurementScalars } from './measurements.utils.js';

import type { WorkspaceMeasurements } from './measurements.utils.js';

const measurements: WorkspaceMeasurements = {
  gap: 6,
  headerHeight: 40,
  gripWidth: 24,
  actionWidth: 32,
  groupActionWidth: 32,
  tabWidth: 120,
  tabMinWidth: 60,
  width: 800,
  height: 600,
  panels: { editor: { suffixWidth: 32, footerHeight: 24 } }
};

describe('workspace measurement equality', () => {
  it('distinguishes the first measurement from unchanged values', () => {
    expect(sameWorkspaceMeasurements(undefined, measurements)).toBe(false);
    expect(sameWorkspaceMeasurements(measurements, measurements)).toBe(true);
    expect(
      sameWorkspaceMeasurements({ ...measurements, panels: undefined }, { ...measurements, panels: undefined })
    ).toBe(true);
  });

  it('compares scalar measurements separately from panel measurements', () => {
    const current = { ...measurements, panels: { editor: { suffixWidth: 50, footerHeight: 60 } } };
    expect(sameWorkspaceMeasurementScalars(measurements, current)).toBe(true);
    expect(sameWorkspaceMeasurements(measurements, current)).toBe(false);
    expect(sameWorkspaceMeasurementScalars(measurements, { ...current, headerHeight: 50 })).toBe(false);
  });

  it('accepts independently captured equal panel measurements', () => {
    const current = { ...measurements, panels: { editor: { suffixWidth: 32, footerHeight: 24 } } };

    expect(sameWorkspaceMeasurements(measurements, current)).toBe(true);
  });

  it.each([
    'gap',
    'headerHeight',
    'gripWidth',
    'actionWidth',
    'groupActionWidth',
    'tabWidth',
    'tabMinWidth',
    'width',
    'height'
  ] as const)('detects a changed %s', property => {
    expect(sameWorkspaceMeasurements(measurements, { ...measurements, [property]: measurements[property]! + 1 })).toBe(
      false
    );
  });

  it('detects different panel identifiers with equal dimensions and record counts', () => {
    const current = { ...measurements, panels: { notes: { suffixWidth: 32, footerHeight: 24 } } };

    expect(sameWorkspaceMeasurements(measurements, current)).toBe(false);
  });

  it('detects added, removed, and absent panel measurements', () => {
    const added = { ...measurements, panels: { ...measurements.panels, notes: { suffixWidth: 0, footerHeight: 0 } } };

    expect(sameWorkspaceMeasurements(measurements, added)).toBe(false);
    expect(sameWorkspaceMeasurements(added, measurements)).toBe(false);
    expect(sameWorkspaceMeasurements(measurements, { ...measurements, panels: undefined })).toBe(false);
    expect(sameWorkspaceMeasurements({ ...measurements, panels: undefined }, measurements)).toBe(false);
  });

  it.each([
    { suffixWidth: 48, footerHeight: 24 },
    { suffixWidth: 32, footerHeight: 40 }
  ])('detects changed panel dimensions %j', editor => {
    expect(sameWorkspaceMeasurements(measurements, { ...measurements, panels: { editor } })).toBe(false);
  });
});
