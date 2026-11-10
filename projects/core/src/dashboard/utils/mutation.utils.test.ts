// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { createFixture, removeFixture } from '@internals/testing';

import { isDashboardCatalogueMutation, isDashboardTitleMutation } from './mutation.utils.js';

import '../define.js';

function recordMutation(target: Node, mutate: () => void): MutationRecord {
  const observer = new MutationObserver(() => {});

  observer.observe(target, { childList: true, subtree: true, characterData: true, attributes: true });
  mutate();

  const record = observer.takeRecords()[0]!;

  observer.disconnect();

  return record;
}

describe('dashboard composition mutations', () => {
  let fixture: HTMLElement;
  let host: HTMLElement;
  let panel: HTMLElement;

  beforeEach(async () => {
    fixture = await createFixture(html`
      <div id="host">
        <nve-dashboard-panel id="panel">
          <nve-dashboard-panel-header>Notes</nve-dashboard-panel-header>
          <nve-dashboard-panel-content><input aria-label="Finding" /></nve-dashboard-panel-content>
        </nve-dashboard-panel>
      </div>
    `);
    host = fixture.querySelector<HTMLElement>('#host')!;
    panel = fixture.querySelector<HTMLElement>('#panel')!;
  });

  afterEach(() => removeFixture(fixture));

  it('recognizes direct panel removal and slot reassignment as membership changes', () => {
    const slot = recordMutation(host, () => panel.setAttribute('slot', 'unused'));

    expect(isDashboardCatalogueMutation(host, slot)).toBe(true);

    const removal = recordMutation(host, () => panel.remove());

    expect(isDashboardCatalogueMutation(host, removal)).toBe(true);
  });

  it('ignores framework markers and application controls as membership changes', () => {
    const marker = recordMutation(host, () => host.append(document.createComment('framework')));
    const control = recordMutation(host, () => host.append(document.createElement('button')));
    const nested = recordMutation(host, () => panel.querySelector('input')!.setAttribute('disabled', ''));

    expect(isDashboardCatalogueMutation(host, marker)).toBe(false);
    expect(isDashboardCatalogueMutation(host, control)).toBe(false);
    expect(isDashboardCatalogueMutation(host, nested)).toBe(false);
  });

  it('updates header titles without treating their content or slots as panel membership', () => {
    const header = panel.querySelector('nve-dashboard-panel-header')!;
    const text = recordMutation(host, () => {
      header.firstChild!.textContent = 'Updated notes';
    });
    const action = document.createElement('button');

    header.append(action);

    const slot = recordMutation(host, () => action.setAttribute('slot', 'suffix'));

    expect(isDashboardTitleMutation(host, text)).toBe(true);
    expect(isDashboardTitleMutation(host, slot)).toBe(true);
    expect(isDashboardCatalogueMutation(host, text)).toBe(false);
    expect(isDashboardCatalogueMutation(host, slot)).toBe(false);
  });
});
