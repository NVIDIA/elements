// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html, type ReactiveController } from 'lit';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { createFixture, removeFixture } from '@internals/testing';

import { decidePointerPlacement } from '../utils/interaction/placement-decision.utils.js';
import { evaluatePlacementOffer } from '../utils/placement/preparation.utils.js';
import { getInitialDragCue } from '../utils/presentation/groups.utils.js';
import { WorkspaceEvaluation } from '../utils/evaluation.utils.js';

import type { WorkspaceDragPreview, WorkspaceDropIntent } from '../utils/interaction/drag-preview.utils.js';
import type { WorkspaceLayout } from '../utils/model/layout.utils.js';
import type { WorkspaceMeasurements } from '../utils/presentation/measurements.utils.js';

vi.mock('../utils/interaction/placement-decision.utils.js', { spy: true });
vi.mock('../utils/placement/preparation.utils.js', { spy: true });
vi.mock('../utils/presentation/groups.utils.js', { spy: true });
import { WorkspaceRearrangeController } from './workspace-rearrange.controller.js';

class RearrangeTestHost extends HTMLElement {
  rearrangeable = true;
  groupable = true;
  detachThreshold = 48;

  readonly updateComplete = Promise.resolve(true);
  readonly #controllers = new Set<ReactiveController>();

  addController(controller: ReactiveController) {
    this.#controllers.add(controller);
  }

  removeController(controller: ReactiveController) {
    this.#controllers.delete(controller);
  }

  requestUpdate() {}

  connectedCallback() {
    this.#controllers.forEach(controller => controller.hostConnected?.());
  }

  disconnectedCallback() {
    this.#controllers.forEach(controller => controller.hostDisconnected?.());
  }
}

const tag = 'workspace-rearrange-test-host';
if (!customElements.get(tag)) customElements.define(tag, RearrangeTestHost);

const bounds = { x: 0, y: 0, width: 400, height: 300 };

function pointerIntent(x: number): WorkspaceDropIntent | undefined {
  if (x < 0) return undefined;
  if (x < 200) return { kind: 'split', destination: { target: 'b', position: 'left' } };
  if (x < 300) return { kind: 'split', destination: { target: 'c', position: 'left' } };
  return { kind: 'split', destination: { target: 'blocked', position: 'left' } };
}

function pointer(type: string, x: number, y = 100) {
  return new PointerEvent(type, {
    clientX: x,
    clientY: y,
    button: 0,
    buttons: type === 'pointerup' ? 0 : 1,
    pointerId: 1,
    pointerType: 'mouse',
    isPrimary: true,
    bubbles: true,
    composed: true
  });
}

describe('workspace rearrange frame scheduling', () => {
  let fixture: HTMLElement;
  let host: RearrangeTestHost;
  let controller: WorkspaceRearrangeController;
  let control: HTMLElement;
  let frames: Map<number, FrameRequestCallback>;
  let nextFrame: number;
  let published: WorkspaceDragPreview | undefined;
  let extent: number;
  let decision: ReturnType<typeof vi.fn<typeof decidePointerPlacement>>;
  let offer: ReturnType<typeof vi.fn<typeof evaluatePlacementOffer>>;
  let preview: ReturnType<typeof vi.fn<(value: WorkspaceDragPreview | undefined) => void>>;
  let commit: ReturnType<typeof vi.fn>;

  beforeEach(async () => {
    fixture = await createFixture(html`<div></div>`);
    host = document.createElement(tag) as RearrangeTestHost;
    host.attachShadow({ mode: 'open' }).innerHTML =
      '<div data-panel="a" style="width:100px;height:30px"></div><div data-destination-ghost></div>';
    control = host.shadowRoot!.querySelector<HTMLElement>('[data-panel]')!;
    frames = new Map();
    nextFrame = 0;
    published = undefined;
    extent = 100;
    vi.stubGlobal(
      'requestAnimationFrame',
      vi.fn((callback: FrameRequestCallback) => {
        const id = ++nextFrame;
        frames.set(id, callback);
        return id;
      })
    );
    vi.stubGlobal(
      'cancelAnimationFrame',
      vi.fn((id: number) => frames.delete(id))
    );
    vi.spyOn(host, 'setPointerCapture').mockImplementation(() => {});
    const layout: WorkspaceLayout = {
      version: 1,
      root: { type: 'group', panels: ['a', 'b', 'c'], active: 'a' },
      closed: []
    };
    const measurements: WorkspaceMeasurements = {
      gap: 0,
      headerHeight: 30,
      gripWidth: 0,
      actionWidth: 0,
      groupActionWidth: 0,
      tabWidth: 100,
      tabMinWidth: 100,
      width: 400,
      height: 300
    };
    const evaluation = new WorkspaceEvaluation(host, {
      panels: [],
      layout,
      source: [],
      measurements,
      policy: 'stop',
      strip: () => null
    });
    decision = vi.mocked(decidePointerPlacement);
    decision.mockImplementation(input => ({ intent: pointerIntent(input.point.x) }));
    offer = vi.mocked(evaluatePlacementOffer);
    offer.mockImplementation(({ intent }) => ({
      feasible: intent.destination.target !== 'blocked',
      allocation: 'overlay',
      cue: { kind: 'group', rect: { ...bounds, width: extent } }
    }));
    vi.mocked(getInitialDragCue).mockReturnValue({ kind: 'group', rect: bounds });
    preview = vi.fn(value => {
      published = value;
    });
    commit = vi.fn(() => true);
    controller = new WorkspaceRearrangeController(host, {
      evaluateWithContext: work => work(evaluation),
      isRearrangementAllowed: () => true,
      getLayout: () => layout,
      getAvailablePanels: () => ['a', 'b', 'c'],
      getMeasurements: () => measurements,
      activateSource: () => {},
      applyPreview: preview,
      commitPlacement: commit
    });
    fixture.append(host);
  });

  afterEach(() => {
    removeFixture(fixture);
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  function press() {
    control.dispatchEvent(pointer('pointerdown', 10, 10));
    vi.clearAllMocks();
  }

  function move(x: number, y = 100) {
    host.dispatchEvent(pointer('pointermove', x, y));
  }

  function flushFrame() {
    const pending = [...frames.values()];
    frames.clear();
    pending.forEach(callback => callback(0));
  }

  function detach() {
    press();
    move(150);
    flushFrame();
    vi.clearAllMocks();
  }

  it('latches threshold crossing immediately and preserves the initial paint barrier', () => {
    const ghost = vi.spyOn(host.shadowRoot!.querySelector('[data-destination-ghost]')!, 'getBoundingClientRect');
    press();
    move(30, 10);
    expect(published?.phase).toBe('attached');
    move(70, 10);
    expect(published?.phase).toBe('detached');
    move(20, 10);
    expect(published?.phase).toBe('detached');
    expect(decision).not.toHaveBeenCalled();
    expect(ghost).not.toHaveBeenCalled();
    expect(frames.size).toBe(1);
    flushFrame();
    expect(ghost).toHaveBeenCalledTimes(1);
    expect(decision.mock.calls[0]![0].point).toEqual({ x: 20, y: 10 });
  });

  it('evaluates only the latest detached sample once in a frame', () => {
    detach();
    const before = published;
    move(210);
    move(230);
    move(250);
    expect(frames.size).toBe(1);
    expect(decision).not.toHaveBeenCalled();
    flushFrame();
    expect(decision).toHaveBeenCalledTimes(1);
    expect(decision).toHaveBeenCalledWith(
      expect.objectContaining({
        source: ['a'],
        point: { x: 250, y: 100 },
        heldIntent: before?.phase === 'detached' ? before.intent : undefined
      })
    );
    expect(preview).toHaveBeenCalledTimes(1);
  });

  it('refreshes selected geometry without reacquiring when no pointer work is pending', () => {
    detach();
    const intent = published?.phase === 'detached' ? published.intent : undefined;
    extent = 160;
    controller.refresh();
    controller.refresh();
    expect(frames.size).toBe(1);
    flushFrame();
    expect(decision).not.toHaveBeenCalled();
    expect(offer).toHaveBeenCalledOnce();
    expect(published?.cue.rect.width).toBe(160);
    expect(published?.phase === 'detached' && published.intent).toEqual(intent);
    expect(preview).toHaveBeenCalledTimes(1);
  });

  it('retains the latest pointer position through a refresh after an offer-less move', () => {
    detach();
    const intent = published?.phase === 'detached' ? published.intent : undefined;
    offer.mockReturnValueOnce(undefined);

    move(250, 120);
    flushFrame();
    expect(published?.point).toEqual({ x: 250, y: 120 });

    controller.refresh();
    flushFrame();
    expect(published?.point).toEqual({ x: 250, y: 120 });
    expect(published?.phase === 'detached' && published.intent).toEqual(intent);
    expect(commit).not.toHaveBeenCalled();
  });

  it('refreshes the feasible fallback before processing a queued move outside the workspace', () => {
    detach();
    extent = 160;
    controller.refresh();
    move(-10);
    controller.refresh();
    flushFrame();
    expect(decision).toHaveBeenCalledTimes(1);
    expect(published?.cue.rect.width).toBe(160);
    expect(published?.point).toEqual({ x: -10, y: 100 });
    expect(preview).toHaveBeenCalledTimes(1);
  });

  it('refreshes the last feasible geometry while leaving a blocked proposal', () => {
    detach();
    move(350);
    flushFrame();
    offer.mockClear();
    extent = 160;
    controller.refresh();
    move(-10);
    flushFrame();
    expect(offer).toHaveBeenCalledTimes(2);
    expect(offer.mock.calls.map(([input]) => input.intent)).toEqual(
      expect.arrayContaining([pointerIntent(150), pointerIntent(350)])
    );
    expect(published?.phase === 'detached' && published.blocked).toBe(false);
    expect(published?.cue.rect.width).toBe(160);
    expect(published?.phase === 'detached' && published.intent).toEqual(pointerIntent(150));
  });

  it.each(['frame', 'release'])('uses the same published evaluation when pending work is flushed by %s', timing => {
    detach();
    const before = published;
    move(250);
    if (timing === 'frame') flushFrame();
    host.dispatchEvent(pointer('pointerup', 250));
    expect(decision).toHaveBeenCalledTimes(1);
    expect(decision.mock.calls[0]![0].heldIntent).toBe(before?.phase === 'detached' ? before.intent : undefined);
    expect(commit).toHaveBeenCalledWith(
      ['a'],
      { kind: 'split', destination: { target: 'c', position: 'left' } },
      undefined
    );
    expect(frames.size).toBe(0);
  });

  it('flushes a pending feasible move before rejecting an older blocked proposal', () => {
    detach();
    move(350);
    flushFrame();
    expect(published?.phase === 'detached' && published.blocked).toBe(true);
    move(250);
    host.dispatchEvent(pointer('pointerup', 250));
    expect(commit).toHaveBeenCalledTimes(1);
    expect(published?.phase).not.toBe('returning-detached');
  });

  it('rejects a pending blocked move instead of committing the older feasible proposal', () => {
    detach();
    move(350);
    host.dispatchEvent(pointer('pointerup', 350));
    expect(commit).not.toHaveBeenCalled();
    expect(published?.phase).toBe('returning-detached');
    expect(frames.size).toBe(0);
  });

  it('keeps the published proposal when release has no queued movement', () => {
    detach();
    host.dispatchEvent(pointer('pointerup', 350));
    expect(decision).not.toHaveBeenCalled();
    expect(commit).toHaveBeenCalledWith(['a'], pointerIntent(150), undefined);
  });

  it.each(['escape', 'cancel', 'disconnect'])('discards pending work and ignores a stale callback after %s', reason => {
    press();
    move(150);
    const callback = [...frames.values()][0]!;
    const ghost = vi.spyOn(host.shadowRoot!.querySelector('[data-destination-ghost]')!, 'getBoundingClientRect');
    if (reason === 'escape')
      host.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true }));
    else if (reason === 'cancel') controller.cancel();
    else host.remove();
    callback(0);
    expect(decision).not.toHaveBeenCalled();
    expect(ghost).not.toHaveBeenCalled();
    expect(commit).not.toHaveBeenCalled();
    expect(frames.size).toBe(0);
  });
});
