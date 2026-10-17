// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { createFixture, elementIsStable, removeFixture } from '@internals/testing';

import { WorkspacePanelHeader } from '@nvidia-elements/core/workspace';
import '@nvidia-elements/core/workspace/define.js';

const configuration = {
  selected: true,
  offset: 12,
  animate: false,
  tabWidth: 160,
  headerHeight: 36,
  suffixEnd: 32,
  clipLeft: 4,
  clipWidth: 140,
  scrollLeft: 0
};

describe(WorkspacePanelHeader.metadata.tag, () => {
  let fixture: HTMLElement;
  let header: WorkspacePanelHeader;
  let strip: HTMLElement;

  beforeEach(async () => {
    fixture = await createFixture(html`
      <nve-workspace-panel id="editor">
        <nve-workspace-panel-header>
          <span slot="prefix">Decoration</span>
          Editor
          <button slot="suffix">Action</button>
        </nve-workspace-panel-header>
      </nve-workspace-panel>
      <div class="scroll-source" style="width:100px;height:10px;overflow:auto">
        <div style="width:400px;height:1px"></div>
      </div>
    `);
    header = fixture.querySelector<WorkspacePanelHeader>('nve-workspace-panel-header')!;
    strip = fixture.querySelector<HTMLElement>('.scroll-source')!;
    await elementIsStable(header);
  });

  afterEach(() => {
    removeFixture(fixture);
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it('should define element and assign itself to the header slot', () => {
    expect(customElements.get(WorkspacePanelHeader.metadata.tag)).toBeDefined();
    expect(header.slot).toBe('header');
  });

  it('should use its panel identifier when no title is supplied', async () => {
    for (const node of [...header.childNodes]) {
      if (!(node instanceof Element) || !node.hasAttribute('slot')) {
        node.remove();
      }
    }

    await elementIsStable(header);

    expect(header.shadowRoot!.querySelector('.title-content')!.textContent).toBe('editor');
  });

  it('should enable suffix controls and render a separator only while selected', async () => {
    const suffix = header.shadowRoot!.querySelector<HTMLElement>('.suffix')!;

    expect(suffix.inert).toBe(true);
    expect(suffix.getAttribute('aria-hidden')).toBe('true');
    expect(header.shadowRoot!.querySelector('.separator')).toBeNull();

    header._configure(configuration);
    await elementIsStable(header);

    expect(suffix.inert).toBe(false);
    expect(suffix.getAttribute('aria-hidden')).toBe('false');
    expect(header._internals.states.has('selected')).toBe(true);
    expect(header.shadowRoot!.querySelector('.separator')).not.toBeNull();

    header._configure({ ...configuration, selected: false });
    await elementIsStable(header);

    expect(suffix.inert).toBe(true);
    expect(header._internals.states.has('selected')).toBe(false);
    expect(header.shadowRoot!.querySelector('.separator')).toBeNull();
  });

  it('should toggle the tab hover state', () => {
    header._hover(true);
    expect(header._internals.states.has('tab-hover')).toBe(true);

    header._hover(false);
    expect(header._internals.states.has('tab-hover')).toBe(false);
  });

  it('should update fallback scrolling even when header configuration is unchanged', async () => {
    vi.stubGlobal('ScrollTimeline', undefined);
    header._configure(configuration);
    await elementIsStable(header);

    const update = vi.spyOn(header, 'requestUpdate');

    header._configure({ ...configuration, scrollLeft: 40 });
    expect(header.style.getPropertyValue('--_workspace-tab-scroll')).toBe('-40px');
    expect(update).not.toHaveBeenCalled();
  });

  it('retains the native scroll animation when its extent changes without seeding fallback styles', async () => {
    const track = header.shadowRoot!.querySelector<HTMLElement>('.label-track')!;
    const extent = strip.scrollWidth - strip.clientWidth;

    header._bindScroll(undefined, 0);

    const read = vi.spyOn(strip, 'scrollLeft', 'get');
    const write = vi.spyOn(header.style, 'setProperty');

    header._bindScroll(strip, extent);
    const animation = track.getAnimations()[0]!;
    const timeline = animation.timeline;
    const cancel = vi.spyOn(animation, 'cancel');
    const animate = vi.spyOn(track, 'animate');

    header._bindScroll(strip, extent + 40);

    expect(track.getAnimations()).toEqual([animation]);
    expect(animation.timeline).toBe(timeline);

    const effect = animation.effect;
    if (!(effect instanceof KeyframeEffect)) {
      throw new Error('Expected keyframe effect');
    }

    expect(effect.getKeyframes().at(-1)?.transform).toBe(`translateX(${-extent - 40}px)`);
    expect(cancel).not.toHaveBeenCalled();
    expect(animate).not.toHaveBeenCalled();
    expect(read).not.toHaveBeenCalled();
    expect(write).not.toHaveBeenCalled();
  });

  it('replaces a native scroll source and releases the animation at zero extent and disconnection', async () => {
    const track = header.shadowRoot!.querySelector<HTMLElement>('.label-track')!;
    const extent = strip.scrollWidth - strip.clientWidth;

    header._bindScroll(strip, extent);
    const original = track.getAnimations()[0]!;

    const alternate = document.createElement('div');
    alternate.style.cssText = 'width:100px;height:10px;overflow:auto';
    alternate.innerHTML = '<div style="width:400px;height:1px"></div>';
    fixture.append(alternate);
    expect(alternate.scrollWidth).toBeGreaterThan(alternate.clientWidth);

    header._bindScroll(alternate, extent);
    const replacement = track.getAnimations()[0]!;

    expect(replacement).not.toBe(original);
    expect(original.playState).toBe('idle');

    const timeline = replacement.timeline;
    if (!(timeline instanceof ScrollTimeline)) {
      throw new Error('Expected scroll timeline');
    }

    expect(timeline.source).toBe(alternate);

    header._bindScroll(strip, 0);
    expect(track.getAnimations()).toHaveLength(0);
    expect(header.style.getPropertyValue('--_workspace-tab-scroll')).toBe(`${-strip.scrollLeft}px`);

    header._bindScroll(strip, extent);
    const rebound = track.getAnimations()[0]!;
    header.remove();

    expect(rebound.playState).toBe('idle');
    expect(header.style.getPropertyValue('--_workspace-tab-scroll')).toBe('0px');
  });
});
