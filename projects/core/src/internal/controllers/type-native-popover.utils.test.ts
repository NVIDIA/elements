// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { beforeEach, afterEach, vi, describe, expect, it } from 'vitest';
import { getHostAnchor, getHostTrigger, hasOpenPopover } from './type-native-popover.utils.js';
import { LogService } from '../services/log.service.js';
import { DOCS_LOG_URL } from '../utils/audit-logs.js';
describe('getHostTrigger', () => {
  it('should return the trigger param if already a DOM node reference', async () => {
    const element = document.createElement('div');
    const trigger = document.createElement('div');
    const match = getHostTrigger(element, trigger);
    expect(match).toBe(trigger);
  });

  it('should find match trigger if a string param is given', async () => {
    const element = document.createElement('div');
    const trigger = document.createElement('div');
    trigger.id = 'test-trigger';

    document.body.appendChild(element);
    document.body.appendChild(trigger);
    const match = getHostTrigger(element, 'test-trigger');
    expect(match).toBe(trigger);
  });

  it('should return document body if no id match was found', async () => {
    const element = document.createElement('div');
    const trigger = document.createElement('div');
    trigger.id = 'test-trigger';

    document.body.appendChild(element);
    document.body.appendChild(trigger);
    const match = getHostTrigger(element, 'test-trigger-not-found');
    expect(match).toBe(document.body);
  });
});

type TestHost = HTMLElement & { anchor?: HTMLElement | string };

describe('getHostAnchor', () => {
  let logSpy;
  let host: TestHost;
  let anchor: HTMLElement;

  beforeEach(() => {
    logSpy = vi.spyOn(LogService, 'warn');
    host = document.createElement('div');
    anchor = document.createElement('div');
    document.body.appendChild(host);
    document.body.appendChild(anchor);
  });

  afterEach(() => {
    vi.restoreAllMocks();
    host.remove();
    anchor.remove();
  });

  it('returns the anchor element when provided as a DOM element', () => {
    host.anchor = document.createElement('div');
    expect(getHostAnchor(host)).toBe(host.anchor);
  });

  it('returns the body when no anchor is provided', () => {
    expect(getHostAnchor(host)).toBe(document.body);
  });

  it('returns the body as a fallback when anchor is not an element and id does not match any elements in the DOM tree', () => {
    host.anchor = 'not-found';
    logSpy.mockClear();
    expect(getHostAnchor(host)).toBe(document.body);
    expect(logSpy).toHaveBeenCalledTimes(1);
  });

  it('returns the body as a fallback when anchor is not an element and is equal to the body', () => {
    const bodyAnchor = document.createElement('div');
    document.body.appendChild(bodyAnchor);
    bodyAnchor.id = 'body';
    expect(getHostAnchor(host)).toBe(document.body);
  });

  it('should not match anchors with same id but different render root', () => {
    host.anchor = 'test-anchor';
    anchor.id = 'test-anchor';
    expect(getHostAnchor(host)).toStrictEqual(anchor);

    const shadowHost = document.createElement('div');
    shadowHost.attachShadow({ mode: 'open' });
    shadowHost.shadowRoot.appendChild(anchor);

    logSpy.mockClear();
    expect(getHostAnchor(host)).toStrictEqual(document.body);
    expect(logSpy).toHaveBeenCalledWith(
      `Provided id "test-anchor" not found in DOM. ${DOCS_LOG_URL}#id-match-not-found`
    );
    shadowHost.remove();
  });
});

describe('hasOpenPopover', () => {
  it('determines if host element contains an open popover', () => {
    const host = document.createElement('div');
    const popover = document.createElement('div');
    popover.popover = 'auto';

    document.body.appendChild(host);
    expect(hasOpenPopover(host)).toBe(false);

    host.appendChild(popover);
    expect(hasOpenPopover(host)).toBe(false);

    popover.showPopover();
    expect(hasOpenPopover(host)).toBe(true);

    host.remove();
  });
});
