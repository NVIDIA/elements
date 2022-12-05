import { describe, expect, it } from 'vitest';
import { ComputePositionReturn } from '@floating-ui/dom';
import { PopoverConfig, setPopoverStyles, setArrowStyles, computePopoverPosition } from './type-popover.utils.js';

describe('setPopoverStyles', () => {
  it('should use position fixed if popover has anchor attached to body', () => {
    const config: PopoverConfig = {
      position: 'center',
      popover: document.createElement('div'),
      anchor: document.body
    };

    setPopoverStyles(config, { x: 0, y: 0 });
    expect(config.popover.style.position).toBe('fixed');
  });

  it('should use position absolute if popover has anchor attached to another element', () => {
    const config: PopoverConfig = {
      position: 'top',
      popover: document.createElement('div'),
      anchor: document.createElement('div')
    };

    setPopoverStyles(config, { x: 0, y: 0 });
    expect(config.popover.style.position).toBe('absolute');
  });

  it('should use position coordinates to the left/top positions', () => {
    const config: PopoverConfig = {
      position: 'top',
      popover: document.createElement('div'),
      anchor: document.createElement('div')
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
    const config: PopoverConfig = { position: 'top', alignment: 'start', popover: popover, arrow, anchor: document.body, arrowPadding: 6, arrowOffset: 4, offset: 12 };
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
    const style = (window.getComputedStyle(config.arrow) as any)._ownerElement._attributes.style.value; // happy-dom does not support getComputedStyle()
    expect(style.includes('left: 10px')).toBe(true);
    expect(style.includes('top: 10px')).toBe(true);
    expect(style.includes('bottom: 4px')).toBe(true);
  });
});

describe('computePopoverPosition', () => {
  it('should assign coorditates for popover position relative to the document body', async () => {
    const popover = document.createElement('div');
    const config: PopoverConfig = { position: 'top', alignment: 'start', popover: popover, anchor: document.body, arrowPadding: 6, arrowOffset: 4, offset: 12, strategy: 'fixed'  };
    
    const position = await computePopoverPosition(config);
    expect(position.x).toBe(12);
    expect(position.y).toBe(12);
    expect(position.strategy).toBe('fixed');
    expect(position.placement).toBe('top-start');
    expect(position.middlewareData.arrow).toBe(undefined);
  });

  it('should assign coorditates for popover position relative to the popover anchor', async () => {
    const popover = document.createElement('div');
    const anchor = document.createElement('div');
    const config: PopoverConfig = { position: 'top', alignment: 'start', popover: popover, anchor,  arrowPadding: 6, arrowOffset: 4, offset: 2, strategy: 'fixed'  };

    const position = await computePopoverPosition(config);
    expect(position.x).toBe(0);
    expect(position.y).toBe(-2);
    expect(position.strategy).toBe('fixed');
    expect(position.placement).toBe('top-start');
    expect(position.middlewareData.arrow).toBe(undefined);
  });

  it('should assign coorditates for popover position relative to the popover anchor with arrow offsets', async () => {
    const popover = document.createElement('div');
    const anchor = document.createElement('div');
    const arrow = document.createElement('div');
    const config: PopoverConfig = { position: 'top', alignment: 'start', popover: popover, anchor, arrow, arrowPadding: 6, arrowOffset: 4, offset: 2, strategy: 'fixed' };

    const position = await computePopoverPosition(config);
    expect(position.x).toBe(-6);
    expect(position.y).toBe(-2);
    expect(position.strategy).toBe('fixed');
    expect(position.placement).toBe('top-start');
    expect(position.middlewareData.arrow).toEqual({ x: 6, centerOffset: -6 });
  });
});