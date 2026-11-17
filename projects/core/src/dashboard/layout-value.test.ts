// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { assert, describe, expect, it, vi } from 'vitest';
import type { LitElement } from 'lit';

import { Dashboard, type DashboardLayout } from './index.js';
import { Workspace, type WorkspaceLayout } from '../workspace/index.js';
import './define.js';
import '../workspace/define.js';

function valueContract<T extends WorkspaceLayout | DashboardLayout>(
  tag: string,
  create: () => LitElement & { get value(): T | undefined; set value(value: T | null | undefined) },
  layout: () => T
) {
  describe(`${tag}: object value contract`, () => {
    it('copies complete values and accepts edits without reflecting or emitting events', () => {
      const element = create();
      const input = layout();
      const expected = structuredClone(input);
      const change = vi.fn();
      element.addEventListener('change', change);

      element.value = input;
      const snapshot = element.value;
      expect(snapshot).toEqual(expected);
      expect(snapshot).not.toBe(input);
      expect(element.value).toBe(snapshot);
      expect(element.hasAttribute('value')).toBe(false);

      // Mutating nested caller data cannot change the accepted snapshot.
      const mutate = (value: unknown) => {
        if (!value || typeof value !== 'object') return;
        for (const child of Object.values(value)) mutate(child);
        if (Array.isArray(value)) value.length = 0;
      };
      mutate(input);
      expect(element.value).toEqual(expected);

      assert.isDefined(snapshot);
      const editable: WorkspaceLayout | DashboardLayout = snapshot;
      if ('closed' in editable) editable.closed.push('a');
      else editable.grid.tracks += 1;
      const edited = structuredClone(snapshot);
      element.value = snapshot;
      expect(element.value).toEqual(edited);
      expect(element.value).not.toBe(snapshot);
      mutate(snapshot);
      expect(element.value).toEqual(edited);
      expect(change).not.toHaveBeenCalled();
    });

    it('parses JSON attributes and keeps property writes separate from the declared attribute', () => {
      const element = create();
      const input = layout();
      const json = JSON.stringify(input);
      element.setAttribute('value', json);
      expect(element.value).toEqual(input);
      element.value = undefined;
      expect(element.value).toBeUndefined();
      expect(element.getAttribute('value')).toBe(json);
      for (const attribute of ['', 'null', '{']) {
        element.setAttribute('value', json);
        element.setAttribute('value', attribute);
        expect(element.value).toBeUndefined();
      }
      element.setAttribute('value', json);
      element.removeAttribute('value');
      expect(element.value).toBeUndefined();
    });

    it.each([null, undefined])('normalizes %s to an absent layout', value => {
      const element = create();
      element.value = layout();
      element.value = value;
      expect(element.value).toBeUndefined();
    });

    it('rejects invalid objects and serialized property writes without replacing the snapshot', () => {
      const element = create();
      element.value = layout();
      const previous = element.value;
      for (const invalid of ['', false, 0, [], {}, { version: 2 }, JSON.stringify(previous)]) {
        expect(() => Reflect.set(element, 'value', invalid)).toThrow(TypeError);
        expect(element.value).toBe(previous);
      }
    });
  });
}

valueContract<WorkspaceLayout>(
  'nve-workspace',
  () => new Workspace(),
  () => ({
    version: 1,
    root: {
      type: 'split',
      axis: 'horizontal',
      weights: [0.5, 0.5],
      children: [
        { type: 'group', panels: ['a', 'b'], active: 'a' },
        { type: 'group', panels: ['c'], active: 'c' }
      ]
    },
    closed: ['b']
  })
);

valueContract<DashboardLayout>(
  'nve-dashboard',
  () => new Dashboard(),
  () => ({
    version: 1,
    grid: { flow: 'vertical', tracks: 4 },
    items: [
      { id: 'a', column: 0, row: 0, columnSpan: 2, rowSpan: 2 },
      { id: 'b', column: 2, row: 0, columnSpan: 2, rowSpan: 2 }
    ]
  })
);
