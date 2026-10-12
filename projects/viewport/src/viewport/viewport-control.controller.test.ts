// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html, LitElement } from 'lit';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createFixture, elementIsStable, removeFixture } from '@internals/testing';
import { ViewportControlController } from './viewport-control.controller.js';
import './define.js';

class ViewportControlTestHost extends LitElement {
  commandfor: string | null = null;
  commandForElement: HTMLElement | null = null;
}

const tag = 'viewport-control-controller-test-host';
if (!customElements.get(tag)) customElements.define(tag, ViewportControlTestHost);

describe('ViewportControlController', () => {
  let fixture: HTMLElement;
  let host: ViewportControlTestHost;
  let controller: ViewportControlController;
  const onChange = vi.fn();

  beforeEach(async () => {
    fixture = await createFixture(html`<div></div>`);
    host = new ViewportControlTestHost();
    controller = new ViewportControlController(host, onChange, {
      parentFallback: true
    });
    onChange.mockClear();
    fixture.append(host);
    await elementIsStable(host);
  });

  afterEach(() => {
    removeFixture(fixture);
    vi.restoreAllMocks();
  });

  describe('target selection', () => {
    it('resolves an id target', () => {
      const target = document.createElement('nve-viewport');
      target.id = 'control-target';
      fixture.append(target);
      host.commandfor = target.id;
      expect(controller.resolveTarget()).toBe(target);
      expect(onChange).toHaveBeenLastCalledWith(target);
    });

    it('uses a direct parent viewport when parent fallback is enabled', () => {
      const parent = document.createElement('nve-viewport');
      fixture.append(parent);
      parent.append(host);
      expect(controller.resolveTarget()).toBe(parent);
    });

    it('does not use the parent when parent fallback is omitted', () => {
      const parent = document.createElement('nve-viewport');
      fixture.append(parent);
      const otherHost = new ViewportControlTestHost();
      const otherController = new ViewportControlController(otherHost, onChange);
      parent.append(otherHost);
      expect(otherController.resolveTarget()).toBeNull();
    });

    it('prioritizes commandfor over the parent fallback', () => {
      const parent = document.createElement('nve-viewport');
      const target = document.createElement('nve-viewport');
      target.id = 'explicit-id-target';
      fixture.append(parent, target);
      parent.append(host);
      host.commandfor = target.id;
      expect(controller.resolveTarget()).toBe(target);
    });

    it('prioritizes commandForElement over commandfor and restores id binding when cleared', () => {
      const idTarget = document.createElement('nve-viewport');
      idTarget.id = 'id-target';
      const elementTarget = document.createElement('nve-viewport');
      fixture.append(idTarget, elementTarget);
      host.commandfor = idTarget.id;
      host.commandForElement = elementTarget;
      expect(controller.resolveTarget()).toBe(elementTarget);
      host.commandForElement = null;
      expect(controller.resolveTarget()).toBe(idTarget);
    });

    it('rejects a target that is not a viewport', () => {
      host.commandForElement = fixture;
      expect(controller.resolveTarget()).toBeNull();
    });

    it('resolves ids within the host shadow root', () => {
      const container = document.createElement('div');
      const shadow = container.attachShadow({ mode: 'open' });
      const target = document.createElement('nve-viewport');
      target.id = 'shadow-target';
      shadow.append(target, host);
      fixture.append(container);
      host.commandfor = target.id;
      expect(controller.resolveTarget()).toBe(target);
    });

    it('skips id lookup while the cached target remains valid', () => {
      const target = document.createElement('nve-viewport');
      target.id = 'cached-target';
      fixture.append(target);
      host.commandfor = target.id;
      controller.resolveTarget();
      const getRootNode = vi.spyOn(host, 'getRootNode');
      onChange.mockClear();
      expect(controller.resolveTarget()).toBe(target);
      controller.hostUpdate();
      expect(getRootNode).not.toHaveBeenCalled();
      expect(onChange).not.toHaveBeenCalled();
    });
  });

  describe('state subscriptions', () => {
    it('reports committed state and capability changes from the bound viewport', () => {
      const target = document.createElement('nve-viewport');
      host.commandForElement = target;
      controller.resolveTarget();
      onChange.mockClear();
      target.dispatchEvent(new Event('viewportchange'));
      target.dispatchEvent(new Event('capabilitieschange'));
      expect(onChange).toHaveBeenCalledTimes(2);
      expect(onChange).toHaveBeenLastCalledWith(target);
    });

    it('detaches both state listeners when the explicit target changes', () => {
      const previous = document.createElement('nve-viewport');
      const replacement = document.createElement('nve-viewport');
      host.commandForElement = previous;
      controller.resolveTarget();
      host.commandForElement = replacement;
      expect(controller.resolveTarget()).toBe(replacement);
      onChange.mockClear();
      previous.dispatchEvent(new Event('viewportchange'));
      previous.dispatchEvent(new Event('capabilitieschange'));
      expect(onChange).not.toHaveBeenCalled();
      replacement.dispatchEvent(new Event('viewportchange'));
      expect(onChange).toHaveBeenCalledOnce();
      expect(onChange).toHaveBeenLastCalledWith(replacement);
    });
  });

  describe('target lifecycle', () => {
    it('retries an unresolved id when resolution is requested again', () => {
      host.commandfor = 'late-target';
      expect(controller.resolveTarget()).toBeNull();
      const target = document.createElement('nve-viewport');
      target.id = host.commandfor;
      fixture.append(target);
      expect(controller.resolveTarget()).toBe(target);
    });

    it('rebinds a same-id replacement and releases the previous subscription', () => {
      const previous = document.createElement('nve-viewport');
      previous.id = 'replaced-target';
      fixture.append(previous);
      host.commandfor = previous.id;
      controller.resolveTarget();
      const replacement = document.createElement('nve-viewport');
      replacement.id = previous.id;
      previous.replaceWith(replacement);
      expect(controller.resolveTarget()).toBe(replacement);
      onChange.mockClear();
      previous.dispatchEvent(new Event('viewportchange'));
      expect(onChange).not.toHaveBeenCalled();
      replacement.dispatchEvent(new Event('viewportchange'));
      expect(onChange).toHaveBeenLastCalledWith(replacement);
    });

    it('releases an id target when its id changes', () => {
      const target = document.createElement('nve-viewport');
      target.id = 'original-id';
      fixture.append(target);
      host.commandfor = target.id;
      controller.resolveTarget();
      target.id = 'changed-id';
      expect(controller.resolveTarget()).toBeNull();
      expect(onChange).toHaveBeenLastCalledWith(null);
      onChange.mockClear();
      target.dispatchEvent(new Event('viewportchange'));
      expect(onChange).not.toHaveBeenCalled();
    });

    it('preserves an explicit element reference when the target is detached', () => {
      const target = document.createElement('nve-viewport');
      fixture.append(target);
      host.commandForElement = target;
      controller.resolveTarget();
      target.remove();
      expect(controller.resolveTarget()).toBe(target);
    });

    it('releases subscriptions on disconnect and restores them on reconnect', () => {
      const target = document.createElement('nve-viewport');
      host.commandForElement = target;
      controller.resolveTarget();
      host.remove();
      expect(controller.resolveTarget()).toBeNull();
      expect(onChange).toHaveBeenLastCalledWith(null);
      onChange.mockClear();
      target.dispatchEvent(new Event('viewportchange'));
      target.dispatchEvent(new Event('capabilitieschange'));
      expect(onChange).not.toHaveBeenCalled();
      fixture.append(host);
      onChange.mockClear();
      target.dispatchEvent(new Event('viewportchange'));
      expect(onChange).toHaveBeenCalledOnce();
      expect(onChange).toHaveBeenLastCalledWith(target);
    });
  });
});
