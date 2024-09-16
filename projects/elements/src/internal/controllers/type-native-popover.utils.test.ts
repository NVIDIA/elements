import { beforeEach, afterEach, vi, describe, expect, it } from 'vitest';
import { associateAnchor, getHostAnchor, getHostTrgger } from './type-native-popover.utils.js';
import { LogService } from '../services/log.service.js';

describe('associateAnchor', () => {
  it('should create a CSS Anchor Position association between two elements', async () => {
    const element = document.createElement('div');
    const anchor = document.createElement('div');
    associateAnchor(element, anchor);
    expect(anchor.id.startsWith('_')).toBe(true);
    expect((anchor.style as any).anchorName).toBe(`--${anchor.id}`);
    expect((element.style as any).positionAnchor).toBe(`--${anchor.id}`);
  });
});

describe('getHostTrgger', () => {
  it('should return the trigger param if already a DOM node reference', async () => {
    const element = document.createElement('div');
    const trigger = document.createElement('div');
    const match = getHostTrgger(element, trigger);
    expect(match).toBe(trigger);
  });

  it('should find match trigger if a string param is given', async () => {
    const element = document.createElement('div');
    const trigger = document.createElement('div');
    trigger.id = 'test-trigger';

    document.body.appendChild(element);
    document.body.appendChild(trigger);
    const match = getHostTrgger(element, 'test-trigger');
    expect(match).toBe(trigger);
  });

  it('should return document body if no id match was found', async () => {
    const element = document.createElement('div');
    const trigger = document.createElement('div');
    trigger.id = 'test-trigger';

    document.body.appendChild(element);
    document.body.appendChild(trigger);
    const match = getHostTrgger(element, 'test-trigger-not-found');
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
