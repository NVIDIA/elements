import { describe, expect, it } from 'vitest';
import type { ComputePositionReturn } from '@floating-ui/dom';
import type { PopoverConfig } from './type-native-anchor-fallback.utils.js';
import { setPopoverStyles, setArrowStyles, computePopoverPosition } from './type-native-anchor-fallback.utils.js';

describe('setPopoverStyles', () => {
  it('should use position fixed if popover has anchor attached to body', () => {
    const config: PopoverConfig = {
      position: 'center',
      popover: document.createElement('div'),
      anchor: document.body,
      strategy: 'fixed'
    };

    setPopoverStyles(config, { x: 0, y: 0 });
    expect(config.popover.style.position).toBe('fixed');
  });

  it('should use position absolute if popover has anchor attached to another element', () => {
    const config: PopoverConfig = {
      position: 'top',
      popover: document.createElement('div'),
      anchor: document.createElement('div'),
      strategy: 'absolute'
    };

    setPopoverStyles(config, { x: 0, y: 0 });
    expect(config.popover.style.position).toBe('absolute');
  });

  it('should use position coordinates to the left/top positions', () => {
    const config: PopoverConfig = {
      position: 'top',
      popover: document.createElement('div'),
      anchor: document.createElement('div'),
      strategy: 'absolute'
    };

    setPopoverStyles(config, { x: 10, y: 20 });
    expect(config.popover.style.position).toBe('absolute');
    expect(config.popover.style.left).toBe('10px');
    expect(config.popover.style.top).toBe('20px');
  });
});

describe('setArrowStyles', () => {
  it('should assign coorditates for arrow position relative to the popover element', () => {
    const popover = document.createElement('div');
    const arrow = document.createElement('div');
    popover.style.width = '100px';
    popover.style.height = '100px';
    arrow.style.width = '4px';
    arrow.style.height = '4px';
    document.body.appendChild(popover);
    document.body.appendChild(arrow);

    const config: PopoverConfig = {
      position: 'top',
      alignment: 'start',
      popover: popover,
      arrow,
      anchor: document.body,
      arrowPadding: 6,
      arrowOffset: 4,
      offset: 12
    };
    const position: ComputePositionReturn = {
      x: 0,
      y: 0,
      strategy: 'absolute',
      placement: 'top-start',
      middlewareData: {
        arrow: {
          centerOffset: 0,
          x: 10,
          y: 10
        }
      }
    };

    setArrowStyles(config, position);
    const style = window.getComputedStyle(config.arrow as HTMLElement);
    expect(style.left).toBe('10px');
    expect(style.top).toBe('10px');
    expect(style.bottom).toBe('2px');

    popover.remove();
    arrow.remove();
  });
});

describe('computePopoverPosition', () => {
  it('should assign coorditates for popover position relative to the document body', async () => {
    const popover = document.createElement('div');
    const config: PopoverConfig = {
      position: 'top',
      alignment: 'start',
      popover: popover,
      anchor: document.body,
      arrowPadding: 6,
      arrowOffset: 4,
      offset: 12,
      strategy: 'fixed'
    };

    const position = await computePopoverPosition(config);
    expect(position.x).toBe(12);
    expect(position.y === 8 || position.y === 12).toBe(true);
    expect(position.strategy).toBe('fixed');
    expect(position.placement).toBe('top-start');
    expect(position.middlewareData.arrow).toBe(undefined);
  });

  it('should assign coorditates for popover position relative to the popover anchor', async () => {
    const popover = document.createElement('div');
    const anchor = document.createElement('div');
    const config: PopoverConfig = {
      position: 'top',
      alignment: 'start',
      popover: popover,
      anchor,
      arrowPadding: 6,
      arrowOffset: 4,
      offset: 2,
      strategy: 'fixed'
    };

    const position = await computePopoverPosition(config);
    expect(position.x).toBe(0);
    expect(position.y).toBe(2);
    expect(position.strategy).toBe('fixed');
    expect(position.placement).toBe('bottom-start');
    expect(position.middlewareData.arrow).toBe(undefined);
  });

  it('should assign coorditates for popover position relative to the popover anchor with arrow offsets', async () => {
    const popover = document.createElement('div');
    const anchor = document.createElement('div');
    const arrow = document.createElement('div');
    const config: PopoverConfig = {
      position: 'top',
      alignment: 'start',
      popover: popover,
      anchor,
      arrow,
      arrowPadding: 6,
      arrowOffset: 4,
      offset: 2,
      strategy: 'fixed'
    };

    const position = await computePopoverPosition(config);
    expect(position.x).toBe(0);
    expect(position.y).toBe(2);
    expect(position.strategy).toBe('fixed');
    expect(position.placement).toBe('bottom-start');
    expect(position.middlewareData.arrow).toEqual({ x: 0, centerOffset: 0 });
  });
});
