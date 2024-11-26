import { beforeEach, afterEach, vi, describe, expect, it } from 'vitest';
import { associateAnchor, getHostAnchor, getHostTrigger, hasOpenPopover } from './type-native-popover.utils.js';
import { LogService } from '../services/log.service.js';

describe('associateAnchor', () => {
  it('should create a CSS Anchor Position association between two elements', async () => {
    const element = document.createElement('div');
    const anchor = document.createElement('div');
    associateAnchor(element, anchor);
    expect((anchor.style as any).anchorName.startsWith('--')).toBe(true);
    expect((element.style as any).positionAnchor.startsWith('--')).toBe(true);
    expect((element.style as any).positionAnchor).toBe((anchor.style as any).anchorName);
  });

  it('should not recreate new anchor name if one already provided', async () => {
    const element = document.createElement('div');
    const anchor = document.createElement('div');
    associateAnchor(element, anchor);

    const originalAnchorName = (anchor.style as any).anchorName;
    expect((element.style as any).positionAnchor).toBe((anchor.style as any).anchorName);

    associateAnchor(element, anchor);
    expect((element.style as any).positionAnchor).toBe(originalAnchorName);
  });

  it('should create a CSS Anchor Position association between two elements with the default id if provided', async () => {
    const element = document.createElement('div');
    const anchor = document.createElement('div');
    element.id = 'test';
    anchor.id = 'test';
    associateAnchor(element, anchor);
    expect(anchor.id.startsWith('_')).toBe(false);
    expect((anchor.style as any).anchorName).toBe('--test');
    expect((element.style as any).positionAnchor).toBe('--test');
  });

  // https://github.com/facebook/react/issues/26839#issuecomment-2277253506
  it('should generate id if a invalid ":" prefixed ID is created via React', async () => {
    const element = document.createElement('div');
    const anchor = document.createElement('div');
    anchor.id = ':test';
    associateAnchor(element, anchor);
    expect((anchor.style as any).anchorName.includes('test')).toBe(false);
    expect((anchor.style as any).positionAnchor.includes('test')).toBe(false);
    expect((anchor.style as any).anchorName.startsWith('--')).toBe(true);
    expect((element.style as any).positionAnchor.startsWith('--')).toBe(true);
    expect((element.style as any).positionAnchor).toBe((anchor.style as any).anchorName);
  });
});

describe('getHostTrgger', () => {
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
  let logSpy: any;
  beforeEach(() => {
    logSpy = vi.spyOn(LogService, 'warn');
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('returns the anchor element when provided as a DOM element', () => {
    const host = document.createElement('div') as TestHost;
    document.body.appendChild(host);
    host.anchor = document.createElement('div');
    expect(getHostAnchor(host)).toBe(host.anchor);
  });

  it('returns the active trigger element when no anchor is provided', () => {
    const host = document.createElement('div') as TestHost;
    const trigger = document.createElement('div');
    document.body.appendChild(trigger);
    host._activeTrigger = trigger;
    expect(getHostAnchor(host)).toBe(host._activeTrigger);
  });

  it('returns the body as a fallback when anchor is not an element and id does not match any elements in the DOM tree', () => {
    const host = document.createElement('div') as TestHost;
    document.body.appendChild(host);
    host.anchor = 'not-found';
    logSpy.mockClear();
    expect(getHostAnchor(host)).toBe(document.body);
    expect(logSpy).toHaveBeenCalledTimes(1);
  });

  it('returns the body as a fallback when anchor is not an element and is equal to the body', () => {
    const host = document.createElement('div') as TestHost;
    document.body.appendChild(host);
    const anchor = document.createElement('div');
    document.body.appendChild(anchor);
    anchor.id = 'body';
    expect(getHostAnchor(host)).toBe(document.body);
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
