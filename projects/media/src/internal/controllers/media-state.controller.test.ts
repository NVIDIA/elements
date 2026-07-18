// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html, LitElement } from 'lit';
import { customElement } from 'lit/decorators/custom-element.js';
import { property } from 'lit/decorators/property.js';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { createFixture, elementIsStable, removeFixture } from '@internals/testing';
import { createMediaState, mediaStateChange, type MediaState } from '../media-state.js';
import { MediaStateController } from './media-state.controller.js';

type MediaStateTarget = HTMLElement & { mediaState: MediaState };

@customElement('media-state-controller-test-element')
class MediaStateControllerTestElement extends LitElement {
  @property({ attribute: false }) commandForElement: HTMLElement | null = null;

  mediaState: MediaState | null = null;

  #mediaStateController = new MediaStateController(this, state => (this.mediaState = state));
}

describe(MediaStateController.name, () => {
  let element: MediaStateControllerTestElement;
  let fixture: HTMLElement;
  let target: MediaStateTarget;

  beforeEach(async () => {
    element = document.createElement('media-state-controller-test-element') as MediaStateControllerTestElement;
    target = createTarget({ volume: 0.5 });
    element.commandForElement = target;
    fixture = await createFixture(html`${element}${target}`);
    await elementIsStable(element);
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should read initial state and listen for state changes', () => {
    expect(element.mediaState).toBe(target.mediaState);

    setMediaState(target, { volume: 0.75 });
    expect(element.mediaState).toBe(target.mediaState);
  });

  it('should ignore invalid state events', () => {
    const mediaState = element.mediaState;
    target.dispatchEvent(new CustomEvent(mediaStateChange, { detail: { paused: false } }));

    expect(element.mediaState).toBe(mediaState);
  });

  it('should retarget and disconnect through the host lifecycle', async () => {
    const nextTarget = createTarget({ volume: 0.75 });
    fixture.append(nextTarget);
    element.commandForElement = nextTarget;
    await elementIsStable(element);

    expect(element.mediaState).toBe(nextTarget.mediaState);

    const mediaState = element.mediaState;
    setMediaState(target, { volume: 1 });
    expect(element.mediaState).toBe(mediaState);

    setMediaState(nextTarget, { volume: 0.25 });
    expect(element.mediaState).toBe(nextTarget.mediaState);

    element.remove();
    const disconnectedState = element.mediaState;
    setMediaState(nextTarget, { volume: 0 });
    expect(element.mediaState).toBe(disconnectedState);
  });
});

function createTarget(state: Partial<MediaState> = {}): MediaStateTarget {
  return Object.assign(document.createElement('div'), { mediaState: createMediaState(state) });
}

function setMediaState(target: MediaStateTarget, state: Partial<MediaState>) {
  target.mediaState = createMediaState(state);
  target.dispatchEvent(new CustomEvent(mediaStateChange, { detail: target.mediaState }));
}
