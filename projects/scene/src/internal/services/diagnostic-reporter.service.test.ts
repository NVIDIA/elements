// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, test, vi } from 'vitest';
import { LAYER_CHILD, LAYER_SOURCE_INVALID } from '../../errors.js';
import { diagnosticReporterService } from './diagnostic-reporter.service.js';

describe('DiagnosticReporterService', () => {
  test('reports one active episode, recovers silently, and reports its recurrence', () => {
    const element = document.createElement('div');
    const errors: CustomEvent[] = [];
    element.addEventListener('nve-scene-error', event => errors.push(event as CustomEvent));
    const error = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const update = (active: boolean) =>
      diagnosticReporterService.update({
        active,
        code: LAYER_SOURCE_INVALID,
        element,
        message: 'test message',
        severity: 'error'
      });

    update(true);
    update(true);
    expect(errors).toHaveLength(1);
    expect(error).toHaveBeenCalledTimes(1);

    update(false);
    update(false);
    expect(errors).toHaveLength(1);
    expect(error).toHaveBeenCalledTimes(1);

    update(true);
    expect(errors).toHaveLength(2);
    expect(error).toHaveBeenCalledTimes(2);
  });

  test('keeps elements independent', () => {
    const first = document.createElement('div');
    const second = document.createElement('div');
    const warning = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const options = { active: true, code: LAYER_CHILD, message: 'warning', severity: 'warning' } as const;

    diagnosticReporterService.update({ ...options, element: first });
    diagnosticReporterService.update({ ...options, element: second });
    diagnosticReporterService.update({ ...options, active: false, element: first });
    diagnosticReporterService.update({ ...options, element: second });
    diagnosticReporterService.update({ ...options, element: first });

    expect(warning).toHaveBeenCalledTimes(3);
  });

  test('keeps episode keys independent on one element', () => {
    const element = document.createElement('div');
    const warning = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const options = { active: true, code: LAYER_CHILD, element, message: 'warning', severity: 'warning' } as const;

    diagnosticReporterService.update({ ...options, episodeKey: 'first' });
    diagnosticReporterService.update({ ...options, episodeKey: 'second' });
    diagnosticReporterService.update({ ...options, episodeKey: 'first' });

    expect(warning).toHaveBeenCalledTimes(2);
  });
});
