// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { beforeEach, afterEach, vi, describe, expect, it } from 'vitest';
import { associateAnchor, getHostAnchor, getHostTrigger, hasOpenPopover } from './type-native-popover.utils.js';
import { LogService } from '../services/log.service.js';
import { DOCS_LOG_URL } from '../utils/audit-logs.js';

describe('associateAnchor', () => {
  it('should create a CSS Anchor Position association between two elements', async () => {
    const element = document.createElement('div');
    const anchor = document.createElement('div');
    associateAnchor(element, anchor);
    expect(anchor.style.anchorName.startsWith('--')).toBe(true);
    expect(element.style.positionAnchor.startsWith('--')).toBe(true);
    expect(element.style.positionAnchor).toBe(anchor.style.anchorName);
  });

  it('should not recreate new anchor name if one already provided', async () => {
    const element = document.createElement('div');
    const anchor = document.createElement('div');
    associateAnchor(element, anchor);

    const originalAnchorName = anchor.style.anchorName;
    expect(element.style.positionAnchor).toBe(originalAnchorName);

    associateAnchor(element, anchor);
    expect(element.style.positionAnchor).toBe(originalAnchorName);
  });

  it('should create a CSS Anchor Position association between two elements with the default id if provided', async () => {
    const element = document.createElement('div');
    const anchor = document.createElement('div');
    element.id = 'test-element';
    anchor.id = 'test-anchor';
    associateAnchor(element, anchor);
    expect(anchor.id.startsWith('_')).toBe(false);
    expect(anchor.style.anchorName).toBe('--_test-anchor');
    expect(element.style.positionAnchor).toBe('--_test-anchor');
  });

  // https://github.com/facebook/react/issues/26839#issuecomment-2277253506
  it('should generate id if a invalid ":" prefixed ID is created via React', async () => {
    const element = document.createElement('div');
    const anchor = document.createElement('div');
    anchor.id = ':test';
    associateAnchor(element, anchor);
    expect(anchor.style.anchorName.includes('test')).toBe(false);
    expect(anchor.style.positionAnchor.includes('test')).toBe(false);
    expect(anchor.style.anchorName.startsWith('--')).toBe(true);
    expect(element.style.positionAnchor.startsWith('--')).toBe(true);
    expect(element.style.positionAnchor).toBe(anchor.style.anchorName);
  });

  it('should not create new anchor name if anchor already has a --_ prefixed name', async () => {
    const element = document.createElement('div');
    const anchor = document.createElement('div');
    anchor.style.anchorName = '--_existing-anchor';
    document.body.appendChild(anchor);

    associateAnchor(element, anchor);

    expect(anchor.style.anchorName).toBe('--_existing-anchor');
    expect(element.style.positionAnchor).toBe('--_existing-anchor');

    anchor.remove();
  });

  it('should append new anchor name when anchor has other names but none with --_ prefix', async () => {
    const element = document.createElement('div');
    const anchor = document.createElement('div');
    anchor.id = 'test-anchor';
    anchor.style.anchorName = '--other-anchor';
    document.body.appendChild(anchor);

    associateAnchor(element, anchor);

    const anchorNames = anchor.style.anchorName;
    expect(anchorNames).toContain('--other-anchor');
    expect(anchorNames).toContain('--_test-anchor');
    expect(element.style.positionAnchor).toBe('--_test-anchor');

    anchor.remove();
  });

  it('should append anchor name to existing multiple anchor names', async () => {
    const element = document.createElement('div');
    const anchor = document.createElement('div');
    anchor.id = 'new-anchor';
    anchor.style.anchorName = '--anchor-1, --anchor-2';
    document.body.appendChild(anchor);

    associateAnchor(element, anchor);

    const anchorNames = anchor.style.anchorName;
    expect(anchorNames).toContain('--anchor-1');
    expect(anchorNames).toContain('--anchor-2');
    expect(anchorNames).toContain('--_new-anchor');
    expect(element.style.positionAnchor).toBe('--_new-anchor');

    anchor.remove();
  });

  it('should not modify anchor when it has --_ prefixed name among multiple names', async () => {
    const element = document.createElement('div');
    const anchor = document.createElement('div');
    anchor.style.anchorName = '--anchor-1, --_my-anchor, --anchor-2';
    document.body.appendChild(anchor);

    const originalAnchorNames = anchor.style.anchorName;

    associateAnchor(element, anchor);

    expect(anchor.style.anchorName).toBe(originalAnchorNames);
    expect(element.style.positionAnchor).toBe('--_my-anchor');

    anchor.remove();
  });

  it('should use element id with --_ prefix when creating anchor name', async () => {
    const element = document.createElement('div');
    const anchor = document.createElement('div');
    anchor.id = 'my-specific-anchor';

    associateAnchor(element, anchor);

    expect(anchor.style.anchorName).toBe('--_my-specific-anchor');
    expect(element.style.positionAnchor).toBe('--_my-specific-anchor');
  });
});

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

type TestHost = HTMLElement & { anchor?: HTMLElement | string; _activeTrigger?: HTMLElement };

describe('getHostAnchor', () => {
  let logSpy;
  let host: TestHost;
  let anchor: HTMLElement;

  beforeEach(() => {
    logSpy = vi.spyOn(LogService, 'warn');
    host = document.createElement('div') as TestHost;
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

  it('returns the active anchor element when no anchor is provided', () => {
    host._activeTrigger = anchor;
    expect(getHostAnchor(host)).toBe(host._activeTrigger);
  });

  it('returns the body as a fallback when anchor is not an element and id does not match any elements in the DOM tree', () => {
    host.anchor = 'not-found';
    logSpy.mockClear();
    expect(getHostAnchor(host)).toBe(document.body);
    expect(logSpy).toHaveBeenCalledTimes(1);
  });

  it('returns the body as a fallback when anchor is not an element and is equal to the body', () => {
    const anchor = document.createElement('div');
    document.body.appendChild(anchor);
    anchor.id = 'body';
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
