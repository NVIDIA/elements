// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createFixture, elementIsStable, removeFixture } from '@internals/testing';
import { WorkspaceRestorationController } from './workspace-restoration.controller.js';
import type { WorkspaceLayout } from '../utils/model/layout.utils.js';
import '../define.js';

function createHost() {
  return Object.assign(document.createElement('div'), {
    addController: vi.fn(),
    removeController: vi.fn(),
    requestUpdate: vi.fn(),
    updateComplete: Promise.resolve(true),
    closable: true,
    rearrangeable: true,
    fullscreenable: true
  });
}

describe('WorkspaceRestorationController', () => {
  let fixture: HTMLElement;
  let controller: WorkspaceRestorationController;
  let applyLayout: ReturnType<typeof vi.fn<(layout: WorkspaceLayout | undefined) => void>>;

  beforeEach(async () => {
    fixture = await createFixture(html`<div></div>`);
    const host = createHost();
    fixture.append(host);
    applyLayout = vi.fn<(layout: WorkspaceLayout | undefined) => void>();
    controller = new WorkspaceRestorationController(host, {
      getLayout: () => undefined,
      applyLayout,
      getTransitionTargets: () => ({ panels: new Map(), groups: [], gutters: new Map() })
    });
    controller.hostConnected();
  });

  afterEach(() => {
    controller.hostDisconnected();
    removeFixture(fixture);
  });

  it('applies zero-duration transitions synchronously and remains inactive', () => {
    const apply = vi.fn();
    controller.transition(apply, { duration: 0 });
    expect(apply).toHaveBeenCalledOnce();
    expect(controller.active).toBe(false);
  });

  it('applies layouts without animation when there are no transition targets', () => {
    const layout: WorkspaceLayout = { version: 1, root: { type: 'group', panels: ['a'], active: 'a' }, closed: [] };
    controller.animateTo(layout, { duration: 100 });
    expect(applyLayout).toHaveBeenCalledExactlyOnceWith(layout);
    expect(controller.active).toBe(false);
  });

  it('retains the immediate path when the requested layout already matches', () => {
    controller.animateTo(undefined, { duration: 100 });
    expect(applyLayout).toHaveBeenCalledExactlyOnceWith(undefined);
    controller.handleMeasurementsChange({
      measurements: {
        width: 1,
        height: 1,
        gap: 0,
        headerHeight: 0,
        gripWidth: 0,
        actionWidth: 0,
        tabWidth: 0,
        tabMinWidth: 0
      },
      spaceChanged: true
    });
    expect(controller.active).toBe(false);
  });

  it('animates changed panel geometry and cancels it when available space changes', async () => {
    const host = createHost();
    const panel = document.createElement('nve-workspace-panel');
    panel.style.cssText = 'position:absolute;left:0;top:0;width:100px;height:100px';
    host.append(panel);
    fixture.append(host);
    await elementIsStable(panel);
    const animation = new WorkspaceRestorationController(host, {
      getLayout: () => undefined,
      applyLayout: () => {},
      getTransitionTargets: () => ({
        panels: new Map([['a', { element: panel, header: undefined }]]),
        groups: [],
        gutters: new Map()
      })
    });
    try {
      animation.transition(
        () => {
          panel.style.width = '200px';
        },
        { duration: 10000 }
      );
      await vi.waitFor(() => expect(panel.getAnimations()).toHaveLength(1));
      expect(animation.active).toBe(true);
      animation.handleMeasurementsChange({
        measurements: {
          width: 1,
          height: 1,
          gap: 0,
          headerHeight: 0,
          gripWidth: 0,
          actionWidth: 0,
          tabWidth: 0,
          tabMinWidth: 0
        },
        spaceChanged: true
      });
      expect(animation.active).toBe(false);
      expect(panel.getAnimations()).toHaveLength(0);
    } finally {
      animation.finish();
    }
  });
});
