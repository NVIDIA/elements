// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { createFixture, elementIsStable, removeFixture } from '@internals/testing';

import { WorkspacePanelContent } from '@nvidia-elements/core/workspace';
import '@nvidia-elements/core/workspace/define.js';

describe(WorkspacePanelContent.metadata.tag, () => {
  let fixture: HTMLElement;
  let element: WorkspacePanelContent;

  beforeEach(async () => {
    fixture = await createFixture(html`
      <nve-workspace-panel>
        <nve-workspace-panel-content>
          <span>Application content</span>
        </nve-workspace-panel-content>
      </nve-workspace-panel>
    `);
    element = fixture.querySelector<WorkspacePanelContent>('nve-workspace-panel-content')!;
    await elementIsStable(element);
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should define element', () => {
    expect(customElements.get(WorkspacePanelContent.metadata.tag)).toBeDefined();
  });

  it('should project supplied content through its default slot', () => {
    const slot = element.shadowRoot!.querySelector('slot')!;
    expect(slot.assignedElements()).toEqual([element.querySelector('span')]);
  });
});
