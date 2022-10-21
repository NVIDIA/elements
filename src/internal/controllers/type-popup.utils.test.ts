import { describe, expect, it } from 'vitest';
import { ComputePositionReturn } from '@floating-ui/dom';
import { PopupConfig, setPopupStyles, setArrowStyles, computePopupPosition } from './type-popup.utils.js';

describe('setPopupStyles', () => {
  it('should use position fixed if popup has anchor attached to body', () => {
    const config: PopupConfig = {
      position: 'center',
      popup: document.createElement('div'),
      anchor: document.body
    };

    setPopupStyles(config, { x: 0, y: 0 });
    expect(config.popup.style.position).toBe('fixed');
  });

  it('should use position absolute if popup has anchor attached to another element', () => {
    const config: PopupConfig = {
      position: 'top',
      popup: document.createElement('div'),
      anchor: document.createElement('div')
    };

    setPopupStyles(config, { x: 0, y: 0 });
    expect(config.popup.style.position).toBe('absolute');
  });

  it('should use position coordinates to the left/top positions', () => {
    const config: PopupConfig = {
      position: 'top',
      popup: document.createElement('div'),
      anchor: document.createElement('div')
    };

    setPopupStyles(config, { x: 10, y: 20 });
    expect(config.popup.style.position).toBe('absolute');
    expect(config.popup.style.left).toBe('10px');
    expect(config.popup.style.top).toBe('20px');
  });
});

describe('setArrowStyles', () => {
  it('should assign coorditates for arrow position relative to the popup element', () => {
    const popup = document.createElement('div');
    const arrow = document.createElement('div');
    const config: PopupConfig = { position: 'top', alignment: 'start', popup, arrow, anchor: document.body, arrowPadding: 6, arrowOffset: 4, offset: 12 };
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

describe('computePopupPosition', () => {
  it('should assign coorditates for popup position relative to the document body', async () => {
    const popup = document.createElement('div');
    const config: PopupConfig = { position: 'top', alignment: 'start', popup, anchor: document.body, arrowPadding: 6, arrowOffset: 4, offset: 12, strategy: 'fixed'  };
    
    const position = await computePopupPosition(config);
    expect(position.x).toBe(12);
    expect(position.y).toBe(12);
    expect(position.strategy).toBe('fixed');
    expect(position.placement).toBe('top-start');
    expect(position.middlewareData.arrow).toBe(undefined);
  });

  it('should assign coorditates for popup position relative to the popup anchor', async () => {
    const popup = document.createElement('div');
    const anchor = document.createElement('div');
    const config: PopupConfig = { position: 'top', alignment: 'start', popup, anchor,  arrowPadding: 6, arrowOffset: 4, offset: 2, strategy: 'fixed'  };

    const position = await computePopupPosition(config);
    expect(position.x).toBe(0);
    expect(position.y).toBe(-2);
    expect(position.strategy).toBe('fixed');
    expect(position.placement).toBe('top-start');
    expect(position.middlewareData.arrow).toBe(undefined);
  });

  it('should assign coorditates for popup position relative to the popup anchor with arrow offsets', async () => {
    const popup = document.createElement('div');
    const anchor = document.createElement('div');
    const arrow = document.createElement('div');
    const config: PopupConfig = { position: 'top', alignment: 'start', popup, anchor, arrow, arrowPadding: 6, arrowOffset: 4, offset: 2, strategy: 'fixed' };

    const position = await computePopupPosition(config);
    expect(position.x).toBe(-6);
    expect(position.y).toBe(-2);
    expect(position.strategy).toBe('fixed');
    expect(position.placement).toBe('top-start');
    expect(position.middlewareData.arrow).toEqual({ x: 6, centerOffset: -6 });
  });
});