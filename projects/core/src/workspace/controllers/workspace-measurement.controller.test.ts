// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createFixture, removeFixture } from '@internals/testing';
import type { WorkspaceMeasurementChange } from '../utils/presentation/measurements.utils.js';
import { WorkspaceMeasurementController } from './workspace-measurement.controller.js';

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

describe('WorkspaceMeasurementController', () => {
  let fixture: HTMLElement;
  let host: ReturnType<typeof createHost>;
  let controller: WorkspaceMeasurementController;
  let applyMeasurements: ReturnType<typeof vi.fn<(change: WorkspaceMeasurementChange) => void>>;

  beforeEach(async () => {
    fixture = await createFixture(html`<div></div>`);
    host = createHost();
    host.attachShadow({ mode: 'open' }).innerHTML =
      '<div class="viewport" style="width:320px;height:200px"></div><div data-chrome><div class="gap-probe" style="width:8px"></div><div class="tab-probe" style="width:100px;height:30px"></div></div>';
    fixture.append(host);
    applyMeasurements = vi.fn<(change: WorkspaceMeasurementChange) => void>();
    controller = new WorkspaceMeasurementController(host, {
      getPanels: () => [],
      isPresented: () => false,
      isCarried: () => false,
      applyMeasurements
    });
  });

  afterEach(() => {
    controller.hostDisconnected();
    vi.restoreAllMocks();
    removeFixture(fixture);
  });

  it('measures viewport and intrinsic chrome and suppresses identical publications', () => {
    controller.hostConnected();
    controller.hostUpdated();
    expect(applyMeasurements).toHaveBeenCalledWith(
      expect.objectContaining({
        measurements: expect.objectContaining({ width: 320, height: 200, gap: 8, tabWidth: 100, headerHeight: 30 }),
        spaceChanged: true
      })
    );
    const count = applyMeasurements.mock.calls.length;
    controller.hostUpdated();
    expect(applyMeasurements).toHaveBeenCalledTimes(count);
  });

  it('refreshes changed probe dimensions after invalidation and disconnects its observer', () => {
    const disconnect = vi.spyOn(ResizeObserver.prototype, 'disconnect');
    try {
      controller.hostConnected();
      controller.hostUpdated();
      const probe = host.shadowRoot?.querySelector<HTMLElement>('.gap-probe');
      if (!probe) throw new Error('Expected gap probe');
      probe.style.width = '12px';
      controller.invalidate();
      controller.hostUpdated();
      expect(applyMeasurements.mock.calls.at(-1)?.[0].measurements.gap).toBe(12);
      controller.hostDisconnected();
      expect(disconnect).toHaveBeenCalledOnce();
    } finally {
      disconnect.mockRestore();
    }
  });
});
