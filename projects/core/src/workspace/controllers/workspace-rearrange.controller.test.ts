// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html, type ReactiveController } from 'lit';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createFixture, removeFixture } from '@internals/testing';
import type {
  WorkspaceDragOffer,
  WorkspaceDragPreview,
  WorkspaceDropIntent
} from '../utils/workspace-drag-preview.utils.js';
import { WorkspaceRearrangeController } from './workspace-rearrange.controller.js';

class RearrangeTestHost extends HTMLElement {
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
  let evaluate: ReturnType<typeof vi.fn<(work: () => void) => void>>;
  let resolve: ReturnType<
    typeof vi.fn<
      (input: { point: { x: number; y: number }; preview?: WorkspaceDragPreview }) => {
        intent: WorkspaceDropIntent | undefined;
      }
    >
  >;
  let offer: ReturnType<
    typeof vi.fn<(source: string[], intent: WorkspaceDropIntent) => WorkspaceDragOffer | undefined>
  >;
  let preview: ReturnType<typeof vi.fn<(value: WorkspaceDragPreview | undefined) => void>>;
  let commit: ReturnType<typeof vi.fn>;
  let returnPreview: ReturnType<typeof vi.fn>;

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
    evaluate = vi.fn(work => work());
    resolve = vi.fn(input => ({ intent: pointerIntent(input.point.x) }));
    offer = vi.fn((_, intent) =>
      intent.kind === 'invalid'
        ? undefined
        : {
            feasible: intent.destination.target !== 'blocked',
            allocation: 'overlay',
            cue: { kind: 'group', rect: { ...bounds, width: extent } }
          }
    );
    preview = vi.fn(value => {
      published = value;
    });
    commit = vi.fn(() => true);
    returnPreview = vi.fn(async () => {});
    controller = new WorkspaceRearrangeController(host, {
      evaluate,
      enabled: () => true,
      capabilities: () => ({ rearrangeable: true, groupable: true }),
      panelSource: () => ['a'],
      allowsMembership: () => true,
      detachThreshold: () => 48,
      catalog: () => ({ targets: [], regions: [], preview: published, bounds }),
      header: () => undefined,
      reservation: () => undefined,
      captureScroll: () => () => {},
      captureFocus: () => undefined,
      initialCue: () => ({ kind: 'group', rect: bounds }),
      groupSource: () => ['a'],
      activate: () => {},
      offer,
      resolve,
      preview,
      returnPreview,
      commit
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
    expect(evaluate).not.toHaveBeenCalled();
    expect(ghost).not.toHaveBeenCalled();
    expect(frames.size).toBe(1);
    flushFrame();
    expect(ghost).toHaveBeenCalledTimes(1);
    expect(resolve.mock.calls[0]![0].point).toEqual({ x: 20, y: 10 });
  });

  it('evaluates only the latest detached sample once in a frame', () => {
    detach();
    const before = published;
    move(210);
    move(230);
    move(250);
    expect(frames.size).toBe(1);
    expect(evaluate).not.toHaveBeenCalled();
    flushFrame();
    expect(evaluate).toHaveBeenCalledTimes(1);
    expect(resolve).toHaveBeenCalledTimes(1);
    expect(resolve.mock.calls[0]![0]).toMatchObject({ point: { x: 250, y: 100 }, preview: before });
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
    expect(resolve).not.toHaveBeenCalled();
    expect(published?.cue.rect.width).toBe(160);
    expect(published?.phase === 'detached' && published.intent).toEqual(intent);
    expect(preview).toHaveBeenCalledTimes(1);
  });

  it('refreshes the feasible fallback before processing a queued move outside the workspace', () => {
    detach();
    extent = 160;
    controller.refresh();
    move(-10);
    controller.refresh();
    flushFrame();
    expect(evaluate).toHaveBeenCalledTimes(1);
    expect(resolve).toHaveBeenCalledTimes(1);
    expect(published?.cue.rect.width).toBe(160);
    expect(published?.point).toEqual({ x: -10, y: 100 });
    expect(preview).toHaveBeenCalledTimes(1);
  });

  it('refreshes the last feasible geometry while leaving a blocked proposal', () => {
    detach();
    move(350);
    flushFrame();
    extent = 160;
    controller.refresh();
    move(-10);
    flushFrame();
    expect(published?.phase === 'detached' && published.blocked).toBe(false);
    expect(published?.cue.rect.width).toBe(160);
    expect(published?.phase === 'detached' && published.intent).toEqual(pointerIntent(150));
  });

  it.each(['frame', 'release'])('uses the same published scene when pending work is flushed by %s', timing => {
    detach();
    const before = published;
    move(250);
    if (timing === 'frame') flushFrame();
    host.dispatchEvent(pointer('pointerup', 250));
    expect(resolve).toHaveBeenCalledTimes(1);
    expect(resolve.mock.calls[0]![0].preview).toBe(before);
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
    expect(returnPreview).not.toHaveBeenCalled();
  });

  it('rejects a pending blocked move instead of committing the older feasible proposal', () => {
    detach();
    move(350);
    host.dispatchEvent(pointer('pointerup', 350));
    expect(commit).not.toHaveBeenCalled();
    expect(returnPreview).toHaveBeenCalledTimes(1);
    expect(frames.size).toBe(0);
  });

  it('keeps the published proposal when release has no queued movement', () => {
    detach();
    host.dispatchEvent(pointer('pointerup', 350));
    expect(resolve).not.toHaveBeenCalled();
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
    expect(evaluate).not.toHaveBeenCalled();
    expect(ghost).not.toHaveBeenCalled();
    expect(commit).not.toHaveBeenCalled();
    expect(frames.size).toBe(0);
  });
});
