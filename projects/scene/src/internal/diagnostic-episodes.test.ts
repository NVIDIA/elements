// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, test, vi } from 'vitest';
import { LAYER_CHILD, MARKER_VALUE } from '../errors.js';
import { DiagnosticEpisodes } from './diagnostic-episodes.js';

describe('DiagnosticEpisodes', () => {
  test('reports one active episode, clears it, and reports its recurrence', () => {
    const element = document.createElement('div');
    const episodes = new DiagnosticEpisodes();
    const errors: CustomEvent[] = [];
    element.addEventListener('nve-scene-error', event => errors.push(event as CustomEvent));
    const error = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const update = (active: boolean) =>
      episodes.update({ active, code: MARKER_VALUE, element, message: 'test message', severity: 'error' });

    expect(update(true)).toBe('started');
    expect(update(true)).toBe('unchanged');
    expect(update(false)).toBe('cleared');
    expect(update(false)).toBe('unchanged');
    expect(update(true)).toBe('started');
    expect(errors).toHaveLength(2);
    expect(error).toHaveBeenCalledTimes(2);
  });

  test('keeps keys and elements independent and resets silently', () => {
    const first = document.createElement('div');
    const second = document.createElement('div');
    const firstEpisodes = new DiagnosticEpisodes();
    const secondEpisodes = new DiagnosticEpisodes();
    const warning = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const options = { active: true, code: LAYER_CHILD, message: 'warning', severity: 'warning' } as const;

    expect(firstEpisodes.update({ ...options, element: first, episodeKey: 'first' })).toBe('started');
    expect(firstEpisodes.update({ ...options, element: first, episodeKey: 'second' })).toBe('started');
    expect(secondEpisodes.update({ ...options, element: second })).toBe('started');
    firstEpisodes.reset();
    expect(firstEpisodes.update({ ...options, element: first, episodeKey: 'first' })).toBe('started');
    expect(warning).toHaveBeenCalledTimes(4);
  });
});
